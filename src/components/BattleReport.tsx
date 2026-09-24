"use client";

import { useEffect, useState } from "react";
import type { BattleGrade, BattleReport as Report, Nation, StaffRemain } from "@/engine/types";
import { GRADE_LABEL, reportHeadline } from "@/engine/battle";
import { BATTLE_PHASES, PHASE_LABEL } from "@/engine/battleConfig";
import { unitTypeById } from "@/packs/core/units";
import { cn } from "@/lib/cn";

const GRADES: BattleGrade[] = [
  "legendary",
  "crushing",
  "hard fought",
  "pyrrhic",
  "narrow",
  "inconclusive",
];

const MAP_ZOOM = 0.14;

export default function BattleReport({
  report,
  nations,
  attackerNationId,
  defenderNationId,
  mapWidth = 6145,
  mapHeight = 3530,
  mapSrc,
  reelLive = false,
  reelDone = false,
  phaseIndex = 0,
  staff = false,
  onContinue,
  onFightOut,
  onDismiss,
  onOverride,
}: {
  report: Report;
  nations: Nation[];
  attackerNationId?: string;
  defenderNationId?: string;
  mapWidth?: number;
  mapHeight?: number;
  mapSrc?: string;
  reelLive?: boolean;
  reelDone?: boolean;
  phaseIndex?: number;
  staff?: boolean;
  onContinue: (staff?: StaffRemain[]) => void;
  onFightOut?: (staff?: StaffRemain[]) => void;
  onDismiss?: () => void;
  onOverride?: (grade: BattleGrade) => void;
}) {
  const nameOf = (id: string) => nations.find((n) => n.id === id)?.name ?? id;
  const grade = report.staffGrade ?? report.grade;
  const atkLines = report.units.filter((u) => report.attackerIds.includes(u.armyId));
  const defLines = report.units.filter((u) => report.defenderIds.includes(u.armyId));
  const atkNations = sideNations(atkLines, attackerNationId);
  const defNations = sideNations(defLines, defenderNationId);
  const headline = reportHeadline(grade, report.winner, report.decisivePhase);
  const total = Math.round(report.attackerLoss + report.defenderLoss);
  const [correct, setCorrect] = useState(false);
  const [remains, setRemains] = useState<Record<string, number>>({});

  useEffect(() => {
    setCorrect(false);
    setRemains(Object.fromEntries(report.units.map((u) => [u.unitId, Math.round(u.remain)])));
  }, [report.phases.length, report.decisivePhase]);

  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (e.key !== "Escape") return;
      if (reelLive && staff) return;
      (onDismiss ?? onContinue)();
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [onContinue, onDismiss, reelLive, staff]);

  function remainsOrUndefined(): StaffRemain[] | undefined {
    if (!correct) return undefined;
    return report.units.map((u) => ({ unitId: u.unitId, remain: remains[u.unitId] ?? u.remain }));
  }

  function commit() {
    onContinue(remainsOrUndefined());
  }

  function fight() {
    onFightOut?.(remainsOrUndefined());
  }

  return (
    <div className="i2-overlay" role="dialog" aria-modal="true" aria-label={headline}>
      <article className="i2-panel">
        <h1 className="i2-title">{headline}</h1>
        <ol className="i2-pips" aria-label="Battle phases">
          {BATTLE_PHASES.map((id, i) => (
            <li
              key={id}
              className={cn(
                "i2-pip",
                i === phaseIndex && "is-current",
                i < phaseIndex && "is-done",
              )}
            >
              {PHASE_LABEL[id]}
            </li>
          ))}
        </ol>

        <div className="i2-top">
          <h2 className="i2-side-head i2-side-head-atk">Attackers</h2>
          <div className="i2-map">
            <MapCrop
              x={report.x}
              y={report.y}
              mapWidth={mapWidth}
              mapHeight={mapHeight}
              src={mapSrc}
            />
          </div>
          <h2 className="i2-side-head i2-side-head-def">Defenders</h2>
          <div className="i2-side-body i2-atk-body">
            {atkNations.map((id) => (
              <div key={id} className="i2-faction">
                <span className="i2-faction-bar" />
                {nameOf(id)}
              </div>
            ))}
            {report.attackerTags.length > 0 && (
              <div className="i2-tags">
                {report.attackerTags.map((t) => (
                  <span key={`a-${t}`} className="i2-tag">
                    {t}
                  </span>
                ))}
              </div>
            )}
          </div>
          <div className="i2-side-body i2-def-body i2-faction-def">
            {defNations.map((id) => (
              <div key={id} className="i2-faction i2-faction-def">
                <span className="i2-faction-bar" />
                {nameOf(id)}
              </div>
            ))}
            {report.defenderTags.length > 0 && (
              <div className="i2-tags">
                {report.defenderTags.map((t) => (
                  <span key={`d-${t}`} className="i2-tag">
                    {t}
                  </span>
                ))}
              </div>
            )}
          </div>
        </div>

        <div className="i2-tables">
          <UnitTable
            title="Attacker units"
            head="i2-col-head-atk"
            lines={atkLines}
            frozen={correct}
            remains={remains}
            onRemain={(id, n) => setRemains((cur) => ({ ...cur, [id]: n }))}
          />
          <UnitTable
            title="Defender units"
            head="i2-col-head-def"
            lines={defLines}
            frozen={correct}
            remains={remains}
            onRemain={(id, n) => setRemains((cur) => ({ ...cur, [id]: n }))}
          />
          <div className="i2-col">
            <h2 className="i2-col-head i2-col-head-cas">Casualties by faction</h2>
            {report.casualtiesByNation.length === 0 ? (
              <p className="i2-empty">None written.</p>
            ) : (
              <table className="i2-sheet">
                <thead>
                  <tr>
                    <th>Faction</th>
                    <th className="num">Dead</th>
                  </tr>
                </thead>
                <tbody>
                  {report.casualtiesByNation.map((c) => (
                    <tr key={c.nationId}>
                      <td>{nameOf(c.nationId)}</td>
                      <td className="num">{Math.round(c.dead)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </div>

        <div className="i2-foot">
          <div className="i2-stat">
            <div className="i2-stat-label">Attacker casualties</div>
            <div className="i2-stat-value">{Math.round(report.attackerLoss)}</div>
          </div>
          <div className="i2-stat">
            <div className="i2-stat-label">Defender casualties</div>
            <div className="i2-stat-value">{Math.round(report.defenderLoss)}</div>
          </div>
          <div className="i2-stat">
            <div className="i2-stat-label">Total casualties</div>
            <div className="i2-stat-value">{total}</div>
          </div>
          {reelLive && staff && onFightOut && !reelDone && (
            <button type="button" className="i2-continue" onClick={fight}>
              Fight it out
            </button>
          )}
          {reelLive && staff ? (
            <button type="button" className={cn("i2-continue", !reelDone && "is-quiet")} onClick={commit}>
              {reelDone ? "Occupy" : "Next phase"}
            </button>
          ) : (
            <button type="button" className="i2-continue" onClick={() => (onDismiss ?? onContinue)()}>
              Close
            </button>
          )}
        </div>

        {staff && (onOverride || reelLive) && (
          <div className="i2-staff">
            {reelLive && (
              <button
                type="button"
                className={cn("i2-freeze", correct && "is-on")}
                aria-pressed={correct}
                onClick={() => setCorrect((v) => !v)}
              >
                {correct ? "Correcting" : "Correct lines"}
              </button>
            )}
            <span>Lines take their dead. Retype only if the ruling is wrong.</span>
            {onOverride && (
              <label>
                Staff grade
                <select value={grade} onChange={(e) => onOverride(e.target.value as BattleGrade)}>
                  {GRADES.map((g) => (
                    <option key={g} value={g}>
                      {GRADE_LABEL[g]}
                    </option>
                  ))}
                </select>
              </label>
            )}
          </div>
        )}
      </article>
    </div>
  );
}

function UnitTable({
  title,
  head,
  lines,
  frozen,
  remains,
  onRemain,
}: {
  title: string;
  head: string;
  lines: Report["units"];
  frozen: boolean;
  remains: Record<string, number>;
  onRemain: (unitId: string, remain: number) => void;
}) {
  return (
    <div className="i2-col">
      <h2 className={`i2-col-head ${head}`}>{title}</h2>
      {lines.length === 0 ? (
        <p className="i2-empty">No lines fielded.</p>
      ) : (
        <table className="i2-sheet">
          <thead>
            <tr>
              <th>Unit type</th>
              <th className="num">Fielded</th>
              <th className="num">Remain</th>
            </tr>
          </thead>
          <tbody>
            {lines.map((line) => (
              <tr key={`${line.armyId}-${line.unitId}`}>
                <td>{line.name || unitTypeById(line.typeId).label}</td>
                <td className="num">{Math.round(line.fielded)}</td>
                <td className="num">
                  {frozen ? (
                    <input
                      className="i2-remain"
                      type="number"
                      min={0}
                      aria-label={`${line.name || line.typeId} remain`}
                      value={Number.isFinite(remains[line.unitId]) ? remains[line.unitId] : Math.round(line.remain)}
                      onChange={(e) => onRemain(line.unitId, Math.max(0, Number(e.target.value) || 0))}
                    />
                  ) : (
                    Math.round(line.remain)
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}

function MapCrop({
  x,
  y,
  mapWidth,
  mapHeight,
  src,
}: {
  x?: number;
  y?: number;
  mapWidth: number;
  mapHeight: number;
  src?: string;
}) {
  const fx = x ?? mapWidth / 2;
  const fy = mapHeight - (y ?? mapHeight / 2);
  return (
    <div className="i2-map-frame">
      <div
        className="i2-map-shift"
        style={{
          width: mapWidth,
          height: mapHeight,
          transform: `translate(${-fx * MAP_ZOOM}px, ${-fy * MAP_ZOOM}px) scale(${MAP_ZOOM})`,
        }}
      >
        {src ? (
          <img src={src} alt="" width={mapWidth} height={mapHeight} />
        ) : (
          <div style={{ width: mapWidth, height: mapHeight, background: "#1a4f73" }} />
        )}
      </div>
    </div>
  );
}

function sideNations(lines: Report["units"], fallback?: string): string[] {
  const ids: string[] = [];
  const add = (id?: string) => {
    if (!id || ids.includes(id)) return;
    ids.push(id);
  };
  add(fallback);
  for (const line of lines) add(line.nationId);
  return ids;
}
