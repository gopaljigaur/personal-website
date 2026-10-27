"""Output/gradient comparisons, causal invariance and input validation."""
import json
from pathlib import Path
import torch
from attention import reference, chunked, pytorch_math


def main():
    torch.set_num_threads(1)
    torch.manual_seed(20261027)
    rows = []
    for dtype in (torch.float64, torch.float32):
        atol, rtol = (1e-10, 1e-9) if dtype == torch.float64 else (2e-5, 2e-4)
        for n, d in ((1, 8), (7, 8), (17, 32), (129, 16)):
            for causal in (False, True):
                for strided in (False, True):
                    def tensor(dim):
                        x = torch.randn(2, 2, n, dim * (2 if strided else 1), dtype=dtype)
                        return (x[..., ::2] if strided else x).requires_grad_()
                    inputs = [tensor(d), tensor(d), tensor(d + 3)]
                    upstream = torch.randn(2, 2, n, d + 3, dtype=dtype)
                    target = pytorch_math(*inputs, causal=causal)
                    grads = torch.autograd.grad(target, inputs, upstream)
                    for name, fn in (('reference', reference), ('query_chunked', chunked)):
                        output = fn(*inputs, causal=causal)
                        actual_grads = torch.autograd.grad(output, inputs, upstream)
                        torch.testing.assert_close(output, target, atol=atol, rtol=rtol)
                        for actual, expected in zip(actual_grads, grads):
                            torch.testing.assert_close(actual, expected, atol=atol, rtol=rtol)
                        rows.append(dict(method=name, dtype=str(dtype), tokens=n, dim=d,
                            causal=causal, noncontiguous=strided, atol=atol, rtol=rtol,
                            output_max_abs=float((output-target).abs().max().detach()),
                            gradient_max_abs=max(float((a-b).abs().max()) for a,b in zip(actual_grads,grads))))
    # Crosses the chunk boundary: future K/V cannot affect earlier outputs.
    q, k, v = [torch.randn(1, 2, 140, 8, dtype=torch.float64) for _ in range(3)]
    changed_k, changed_v = k.clone(), v.clone()
    changed_k[..., 130:, :] += 50
    changed_v[..., 130:, :] -= 50
    for fn in (reference, chunked, pytorch_math):
        a, b = fn(q,k,v,causal=True), fn(q,changed_k,changed_v,causal=True)
        torch.testing.assert_close(a[..., :130, :], b[..., :130, :], atol=1e-10, rtol=1e-9)
        assert not torch.allclose(a[..., 130:, :], b[..., 130:, :])
    # Independent finite-difference gradient check, beyond comparing implementations.
    tiny = tuple(torch.randn(1,1,3,2,dtype=torch.float64,requires_grad=True) for _ in range(3))
    for fn in (reference, chunked):
        assert torch.autograd.gradcheck(lambda *args: fn(*args,causal=True), tiny)
    for fn in (reference, chunked, pytorch_math):
        try:
            fn(q, k[..., :-1, :], v)
        except ValueError:
            pass
        else:
            raise AssertionError('Mismatched sequence lengths were accepted')
    out=Path(__file__).parent/'results'
    out.mkdir(exist_ok=True)
    result={'torch':torch.__version__,'comparison_cases':rows,'causal_invariance':'passed for all three methods',
            'finite_difference_gradcheck':'passed for reference and chunked, causal float64',
            'invalid_shape_check':'passed for all three methods'}
    (out/'correctness.json').write_text(json.dumps(result,indent=2)+'\n')
    print(f'PASS: {len(rows)} output/gradient comparisons; causal invariance; finite-difference gradients; invalid shapes')
    print('Worst absolute output error:',max(r['output_max_abs'] for r in rows))
    print('Worst absolute gradient error:',max(r['gradient_max_abs'] for r in rows))


if __name__ == '__main__':
    main()
