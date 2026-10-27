# Where attention uses memory: local experiment

Status: executed CPU investigation, unpublished. This is an educational reproduction and measurement exercise, not a novel attention algorithm or previous employment achievement.

## Run

```sh
cd drafts/ml-portfolio/experiments/attention
python3 check.py
python3 benchmark.py --lengths 128 512 1024 --repeats 10 --warmup 3
python3 plot.py
```

The recorded run used Python 3.12.10, PyTorch 2.13.0 and matplotlib 3.11.1 on macOS arm64. A minimal dependency pin file is provided; this is not a full transitive lockfile. CPU execution uses one PyTorch thread. No GPU was accessible. Do not present these timings as CUDA or MPS measurements.

## What is checked

- 64 comparisons of outputs and Q/K/V gradients against the explicitly selected PyTorch math backend.
- Float64 and float32; square causal and unmasked attention; contiguous and strided inputs; token counts 1, 7, 17 and 129; different query/key and value dimensions.
- Causal invariance across the query-chunk boundary: perturbing future keys and values leaves earlier outputs unchanged.
- Independent finite-difference gradient checks for both handwritten implementations.
- Rejection of mismatched sequence lengths.

Tolerances were set in `check.py` before execution. The per-case errors and tolerances are in `results/correctness.json`.

## What is measured

`benchmark.py` compares a direct implementation, query chunks of 128, and PyTorch's forced math backend. Inference runs under `no_grad`; training runs include forward and gradients of all three inputs, with a fixed random upstream gradient. Warmup precedes timing. Methods are interleaved in seeded random order. No `torch.compile` is used.

Raw samples, environment details and source hashes at execution are in `results/benchmark.json`. The repository base commit is recorded, but these experimental files were uncommitted. A seeded run makes inputs repeatable; timings still vary, especially with other applications active.

## Storage is not peak memory

There are two deliberately different quantities:

1. **Calculated storage of a single score tensor:** dimensions multiplied by float32 element size. This is not measured process memory.
2. **Observed unique tensor storage saved by autograd during forward:** obtained through saved-tensor hooks, deduplicating underlying storage pointers and excluding pre-existing Q/K/V and upstream-gradient storage. This is not peak memory either. It excludes allocator overhead, transients and gradients that are not saved for backward.

For unmasked attention at N=1024, the direct score tensor is 32 MiB and each query-chunk score tensor is 4 MiB. Yet both handwritten implementations save 32 MiB of intermediate storage for backward. Query chunking reduces an individual allocation while ordinary autograd retains intermediates across chunks. The observed causal saved storage is 33 MiB for both, including saved masks.

This does not establish actual inference peak-memory savings or total training-memory use. A GPU follow-up needs supported fused backends, synchronized timing and allocator peak measurements. It is explicitly outside the recorded results.

## Files

- `attention.py`: the three implementations.
- `check.py`: meaningful correctness checks, independent gradient check and causal test.
- `benchmark.py`: timing and saved-storage measurement.
- `plot.py`: standalone figures generated from recorded data.
- `results/`: raw results and figures.

## Attribution

Attention is an established operation. Query chunking here is a simple baseline, not FlashAttention. See [PyTorch's scaled dot-product attention documentation](https://docs.pytorch.org/docs/2.14/generated/torch.nn.functional.scaled_dot_product_attention.html) and the [FlashAttention paper](https://arxiv.org/abs/2205.14135) for library semantics and the original IO-aware algorithm. Online documentation was version 2.14 when researched; the actual measured runtime was 2.13.0.
