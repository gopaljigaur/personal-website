"""CPU-only timings and autograd saved-tensor accounting, not GPU benchmarks."""
import argparse
import hashlib
import json
import platform
import random
import statistics
import subprocess
import time
from pathlib import Path
import torch
from attention import METHODS

ROOT=Path(__file__).resolve().parent


def saved_storage(fn, inputs, upstream, causal):
    # Count unique storages saved by autograd, excluding existing input storages.
    # This is NOT peak process/device memory: excludes transient allocations,
    # allocator overhead, gradient buffers and storage never saved by autograd.
    excluded={x.untyped_storage().data_ptr() for x in (*inputs,upstream)}
    storage={}
    def pack(tensor):
        s=tensor.untyped_storage()
        if s.data_ptr() not in excluded:
            storage[s.data_ptr()]=s.nbytes()
        return tensor
    with torch.autograd.graph.saved_tensors_hooks(pack,lambda x:x):
        output=fn(*inputs,causal=causal)
        total=sum(storage.values())
        torch.autograd.grad(output,inputs,upstream)
    return total


def main():
    parser=argparse.ArgumentParser()
    parser.add_argument('--lengths',type=int,nargs='+',default=[128,512,1024])
    parser.add_argument('--repeats',type=int,default=10)
    parser.add_argument('--warmup',type=int,default=3)
    args=parser.parse_args()
    torch.set_num_threads(1)
    torch.manual_seed(20261027)
    rng=random.Random(20261027)
    rows=[]
    for n in args.lengths:
        base=[torch.randn(1,8,n,64,dtype=torch.float32) for _ in range(3)]
        upstream=torch.randn_like(base[0])
        for causal in (False,True):
            for mode in ('inference','forward_backward'):
                inputs=[x.detach().requires_grad_(mode=='forward_backward') for x in base]
                def run(name):
                    if mode=='inference':
                        with torch.no_grad():
                            return METHODS[name](*inputs,causal=causal)
                    result=METHODS[name](*inputs,causal=causal)
                    return torch.autograd.grad(result,inputs,upstream)
                samples={name:[] for name in METHODS}
                for _ in range(args.warmup):
                    for name in METHODS: run(name)
                # Interleave methods in seeded random order to reduce ordering bias.
                for _ in range(args.repeats):
                    order=list(METHODS); rng.shuffle(order)
                    for name in order:
                        start=time.perf_counter_ns()
                        result=run(name)
                        end=time.perf_counter_ns()
                        del result
                        samples[name].append((end-start)/1e6)
                for name,values in samples.items():
                    saved=saved_storage(METHODS[name],inputs,upstream,causal) if mode=='forward_backward' else None
                    row=dict(method=name,tokens=n,causal=causal,mode=mode,samples_ms=values,
                        median_ms=statistics.median(values),min_ms=min(values),max_ms=max(values),
                        saved_intermediate_storage_bytes=saved,
                        theoretical_single_score_tensor_bytes=(8*min(128,n)*n*4 if name=='query_chunked' else 8*n*n*4))
                    rows.append(row)
                    print(f'{name:14} N={n:4} causal={causal} {mode:16} median={row["median_ms"]:.3f}ms saved={saved}',flush=True)
    try:
        revision=subprocess.check_output(['git','rev-parse','HEAD'],cwd=ROOT,text=True).strip()
    except subprocess.CalledProcessError:
        revision=None
    report=dict(environment=dict(python=platform.python_version(),torch=torch.__version__,
        system=platform.system(),release=platform.release(),machine=platform.machine(),device='cpu',
        threads=torch.get_num_threads(),dtype='float32',batch=1,heads=8,head_dim=64,
        compiled=False,seed=20261027,warmup=args.warmup,repeats=args.repeats,
        git_base_revision=revision,source_status='local uncommitted experiment',
        source_sha256={p.name:hashlib.sha256(p.read_bytes()).hexdigest() for p in ROOT.glob('*.py')},
        backend='PyTorch comparison explicitly forced to SDPBackend.MATH; no fused GPU measurements'),
        limitations=['CPU timing only; not GPU performance','Saved storage is not peak memory',
                    'Other applications may contend for CPU; ten repetitions are exploratory, not a hardware benchmark',
                    'Single-threaded float32 square self-attention; no dropout, padding or grouped-query attention'],
        rows=rows)
    out=ROOT/'results'; out.mkdir(exist_ok=True)
    (out/'benchmark.json').write_text(json.dumps(report,indent=2)+'\n')


if __name__=='__main__': main()
