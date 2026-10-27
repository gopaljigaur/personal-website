"""Readable square self-attention baselines; no dropout, padding or GQA."""
import math
import torch
from torch.nn import functional as F
from torch.nn.attention import SDPBackend, sdpa_kernel


def validate(q, k, v):
    if q.ndim != 4 or q.shape != k.shape:
        raise ValueError('Q and K must have matching [batch, heads, tokens, dim] shapes')
    if v.ndim != 4 or v.shape[:3] != q.shape[:3]:
        raise ValueError('V must match Q batch, heads and tokens')
    if any(size == 0 for size in (*q.shape, v.shape[-1])):
        raise ValueError('All dimensions must be nonzero')
    if not (q.dtype == k.dtype == v.dtype and q.device == k.device == v.device):
        raise ValueError('Inputs must share dtype and device')
    if not all(x.is_floating_point() for x in (q, k, v)):
        raise ValueError('Inputs must be floating point')


def reference(q, k, v, *, causal=False):
    validate(q, k, v)
    scores = (q @ k.transpose(-2, -1)) / math.sqrt(q.shape[-1])
    if causal:
        n = q.shape[-2]
        allowed = torch.ones(n, n, dtype=torch.bool, device=q.device).tril()
        scores = scores.masked_fill(~allowed, -torch.inf)
    return torch.softmax(scores, dim=-1) @ v


def chunked(q, k, v, *, causal=False, chunk_size=128):
    """Chunk queries, not keys: every query still attends to all permitted keys.

    In inference this bounds each score matrix to chunk_size × N. In training,
    ordinary autograd may retain intermediates from every chunk. Not FlashAttention.
    """
    validate(q, k, v)
    if chunk_size <= 0:
        raise ValueError('chunk_size must be positive')
    n, dim = q.shape[-2:]
    outputs = []
    for start in range(0, n, chunk_size):
        stop = min(start + chunk_size, n)
        scores = (q[..., start:stop, :] @ k.transpose(-2, -1)) / math.sqrt(dim)
        if causal:
            allowed = torch.arange(n, device=q.device)[None, :] <= torch.arange(
                start, stop, device=q.device
            )[:, None]
            scores = scores.masked_fill(~allowed, -torch.inf)
        outputs.append(torch.softmax(scores, dim=-1) @ v)
    return torch.cat(outputs, dim=-2)


def pytorch_math(q, k, v, *, causal=False):
    validate(q, k, v)
    with sdpa_kernel(SDPBackend.MATH):
        return F.scaled_dot_product_attention(q, k, v, dropout_p=0., is_causal=causal)


METHODS = {'reference': reference, 'query_chunked': chunked, 'pytorch_math': pytorch_math}
