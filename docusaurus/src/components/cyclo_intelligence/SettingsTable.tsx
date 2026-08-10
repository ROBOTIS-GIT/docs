import React from 'react';
import './SettingsTable.css';

type Row = {name: string; points: string[]};

type Props = {
  columns: [string, string];
  rows: Row[];
};

export default function SettingsTable({columns, rows}: Props): React.JSX.Element {
  return (
    <div className="stbl-wrap">
      <table className="stbl">
        <thead>
          <tr>
            <th className="stbl-name">{columns[0]}</th>
            <th>{columns[1]}</th>
          </tr>
        </thead>
        <tbody>
          {rows.map((row) => (
            <tr key={row.name}>
              <td className="stbl-name">
                <code>{row.name}</code>
              </td>
              <td>
                <ul>
                  {row.points.map((p) => (
                    <li key={p}>{p}</li>
                  ))}
                </ul>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
