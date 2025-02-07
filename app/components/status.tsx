
function StatusItem({ status, value }) {
  return (
    <div className="status-item flex-1">
      <div className="status-item__title font-semibold mb-2 bg-gradient-to-tr from-blue-600 via-green-500 to-indigo-400 inline-block text-transparent bg-clip-text leading-normal">{status}</div>
      <div className="status-item__value dark:text-neutral-100 text-neutral-950">{value}</div>
    </div>
  );
}

export function StatusCard() {
    return (
        <div className="status-card mb-14 flex flex-col sm:flex-row gap-8 sm:gap-4">
            <StatusItem status="Current role" value="Graduate Research Assistant" />
            <StatusItem status="Workplace" value="ML Lab @ University of Freiburg" />
        </div>
    );
}