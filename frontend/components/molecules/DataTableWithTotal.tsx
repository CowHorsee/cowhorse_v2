export type DataTableColumn = {
  key: string;
  label: string;
};

export type DataTableRow = {
  key: string;
  values: Record<string, string>;
};

type DataTableWithTotalProps = {
  columns: DataTableColumn[];
  rows: DataTableRow[];
  emptyLabel: string;
  totalLabel?: string;
  totalValue?: string;
};

export default function DataTableWithTotal({
  columns,
  rows,
  emptyLabel,
  totalLabel,
  totalValue,
}: DataTableWithTotalProps) {
  const shouldShowTotalRow = Boolean(totalLabel && totalValue);

  return (
    <div className="mt-4 overflow-x-auto rounded-2xl border border-slate-200">
      <table className="min-w-full divide-y divide-slate-200 text-sm">
        <thead className="bg-slate-50">
          <tr className="text-left text-xs uppercase tracking-[0.12em] text-slate-500">
            {columns.map((column) => (
              <th key={column.key} className="px-4 py-3">
                {column.label}
              </th>
            ))}
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-100 bg-white">
          {rows.length ? (
            rows.map((row) => (
              <tr key={row.key}>
                {columns.map((column, index) => (
                  <td
                    key={`${row.key}-${column.key}`}
                    className={`px-4 py-3 ${
                      index === 0
                        ? 'font-semibold text-brand-blue'
                        : 'text-slate-700'
                    }`}
                  >
                    {row.values[column.key] ?? '-'}
                  </td>
                ))}
              </tr>
            ))
          ) : (
            <tr>
              <td
                colSpan={columns.length}
                className="px-4 py-8 text-center text-slate-500"
              >
                {emptyLabel}
              </td>
            </tr>
          )}
        </tbody>
        {shouldShowTotalRow ? (
          <tfoot className="border-t border-slate-200">
            <tr>
              <td
                colSpan={Math.max(columns.length - 1, 1)}
                className="px-4 py-3 text-right text-xs font-bold uppercase tracking-[0.12em] text-slate-600"
              >
                {totalLabel}
              </td>
              <td className="px-4 py-3 text-xs font-bold text-brand-blue">
                {totalValue}
              </td>
            </tr>
          </tfoot>
        ) : null}
      </table>
    </div>
  );
}
