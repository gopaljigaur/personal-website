"""Generate standalone figures from recorded measurements, never invented data."""
import json
from pathlib import Path
import matplotlib
matplotlib.use('Agg')
import matplotlib.pyplot as plt

ROOT=Path(__file__).resolve().parent
data=json.loads((ROOT/'results/benchmark.json').read_text())
rows=data['rows']
names={'reference':'Direct implementation','query_chunked':'Query chunks of 128','pytorch_math':'PyTorch math backend'}
colors={'reference':'#087e8b','query_chunked':'#bd5a21','pytorch_math':'#7158a5'}
plt.rcParams.update({'font.size':11,'axes.spines.top':False,'axes.spines.right':False,'figure.facecolor':'white'})
fig,axes=plt.subplots(2,2,figsize=(11,8),layout='constrained')
for i,mode in enumerate(('inference','forward_backward')):
    for j,causal in enumerate((False,True)):
        ax=axes[i,j]
        for method in names:
            r=[x for x in rows if x['method']==method and x['mode']==mode and x['causal']==causal]
            ax.plot([x['tokens'] for x in r],[x['median_ms'] for x in r],marker='o',color=colors[method],label=names[method])
            ax.fill_between([x['tokens'] for x in r],[x['min_ms'] for x in r],[x['max_ms'] for x in r],color=colors[method],alpha=.1)
        ax.set(title=('Causal' if causal else 'Unmasked')+' · '+('Inference' if i==0 else 'Forward + backward'),xlabel='Sequence length',ylabel='Time (ms)')
        ax.grid(alpha=.2)
axes[0,0].legend(fontsize=9)
fig.suptitle('Local CPU attention timings\n1 thread · float32 · batch 1 · 8 heads · head dim 64\nMedian and min–max range of 10 runs; not GPU results',fontsize=13)
fig.savefig(ROOT/'results/latency.png',dpi=170)
plt.close(fig)

fig,axes=plt.subplots(1,2,figsize=(11,4.6),layout='constrained')
for method in ('reference','query_chunked'):
    r=[x for x in rows if x['method']==method and x['mode']=='forward_backward' and not x['causal']]
    axes[0].plot([x['tokens'] for x in r],[x['theoretical_single_score_tensor_bytes']/2**20 for x in r],marker='o',label=names[method],color=colors[method])
    axes[1].plot([x['tokens'] for x in r],[x['saved_intermediate_storage_bytes']/2**20 for x in r],marker='o',linestyle='--' if method=='query_chunked' else '-',label=names[method],color=colors[method])
for ax in axes:
    ax.set(xlabel='Sequence length',ylabel='MiB'); ax.grid(alpha=.2); ax.legend(fontsize=9)
axes[0].set_title('Calculated size of one score tensor')
axes[1].set_title('Observed unique storage saved for backward\nCurves overlap; excludes input storage')
fig.suptitle('Smaller chunks do not imply smaller autograd storage\nUnmasked float32 attention; neither plot measures peak memory',fontsize=13)
fig.savefig(ROOT/'results/storage.png',dpi=170)
plt.close(fig)
print('Wrote results/latency.png and results/storage.png')
