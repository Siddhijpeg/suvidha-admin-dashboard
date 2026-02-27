export default function Table({ columns, data, onRowClick }) {
  return (
    <div className="overflow-x-auto">
      <table className="w-full text-sm">
        <thead>
          <tr className="text-[11px] uppercase text-slate-400 bg-slate-50 dark:bg-white/3">
            {columns.map((col) => (
              <th
                key={col.key}
                className="px-5 py-3 text-left font-semibold whitespace-nowrap"
                style={{ width: col.width }}
              >
                {col.label}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {data.length === 0 ? (
            <tr>
              <td colSpan={columns.length} className="px-5 py-10 text-center text-slate-400 text-sm">
                No records found
              </td>
            </tr>
          ) : (
            data.map((row, i) => (
              <tr
                key={row.id || i}
                onClick={() => onRowClick?.(row)}
                className={`border-t border-slate-50 dark:border-white/5 transition-colors ${
                  onRowClick ? "cursor-pointer hover:bg-blue-50/50 dark:hover:bg-white/3" : ""
                } ${i % 2 === 1 ? "bg-slate-50/30 dark:bg-white/[0.01]" : ""}`}
              >
                {columns.map((col) => (
                  <td key={col.key} className="px-5 py-3 text-slate-700 dark:text-slate-300 whitespace-nowrap">
                    {col.render ? col.render(row[col.key], row) : row[col.key]}
                  </td>
                ))}
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  );
}
