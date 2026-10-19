import React, { useEffect, useRef, useState } from "react";
import Link from "@docusaurus/Link";
import useBaseUrl from "@docusaurus/useBaseUrl";
import "./styles.css";

type Model = "leader" | "follower";
type Converter = "bic30" | "xl4015";
type View = "prepare" | "3d" | "videos";
type Selection = { model: Model; converter: Converter; step?: number };

function selection(search: string): Selection {
  const params = new URLSearchParams(search);
  const model = params.get("model") === "follower" ? "follower" : "leader";
  const step = Number(params.get("step"));
  return {
    model,
    converter:
      model === "follower" && params.get("converter") === "xl4015"
        ? "xl4015"
        : "bic30",
    step: Number.isInteger(step) && step > 0 && step <= 1000 ? step : undefined,
  };
}

function query(value: Selection): string {
  const params = new URLSearchParams({ model: value.model });
  if (value.model === "follower" && value.converter === "xl4015")
    params.set("converter", "xl4015");
  if (value.step) params.set("step", String(value.step));
  return params.toString();
}

/** The iframe owns WebGL and its lifecycle; the document owns the canonical URL. */
export default function OmxAssemblyGuide(): React.JSX.Element {
  const [chosen, setChosen] = useState<Selection>({
    model: "leader",
    converter: "bic30",
  });
  const [view, setView] = useState<View>("prepare");
  const [clip, setClip] = useState(1);
  const [frameSource, setFrameSource] = useState("");
  const frame = useRef<HTMLIFrameElement>(null);
  const appUrl = useBaseUrl("/interactive/omx/index.html");
  const imageBase = useBaseUrl(
    "/img/systems/omx/quick_start_guide/assembly_guide/",
  );
  const videoBase = useBaseUrl("/img/systems/omx/assembly_guide/");
  const title = chosen.model === "leader" ? "Leader" : "Follower";

  function navigate(next: View, value = chosen) {
    const url = new URL(window.location.href);
    url.search = query(value);
    url.searchParams.set("view", next);
    window.history.pushState(window.history.state, "", url);
    setChosen(value);
    setView(next);
    if (next === "3d") setFrameSource(`${appUrl}?${query(value)}`);
  }

  function choose(value: Selection) {
    setChosen(value);
    setClip(1);
    const url = new URL(window.location.href);
    url.search = query(value);
    url.searchParams.set("view", view);
    window.history.replaceState(window.history.state, "", url);
  }

  useEffect(() => {
    function restoreLocation() {
      const value = selection(window.location.search);
      const requested = new URLSearchParams(window.location.search).get("view");
      const next =
        requested === "videos"
          ? "videos"
          : requested === "prepare"
            ? "prepare"
            : value.step || requested === "3d"
              ? "3d"
              : "prepare";
      setChosen(value);
      setView(next);
      if (next === "3d") {
        if (frame.current)
          frame.current.contentWindow?.postMessage(
            { type: "omx:navigate", search: query(value) },
            window.location.origin,
          );
        else setFrameSource(`${appUrl}?${query(value)}`);
      }
    }
    function receive(event: MessageEvent) {
      if (
        event.source !== frame.current?.contentWindow ||
        event.origin !== window.location.origin ||
        event.data?.type !== "omx:state" ||
        typeof event.data.search !== "string"
      )
        return;
      const value = selection(event.data.search);
      setChosen(value);
      const url = new URL(window.location.href);
      url.search = query(value);
      url.searchParams.set("view", "3d");
      window.history.replaceState(window.history.state, "", url);
    }
    restoreLocation();
    window.addEventListener("popstate", restoreLocation);
    window.addEventListener("message", receive);
    return () => {
      window.removeEventListener("popstate", restoreLocation);
      window.removeEventListener("message", receive);
    };
  }, [appUrl]);

  return (
    <section
      className={`omx-guide omx-guide--${view}`}
      aria-label="OMX assembly guide"
    >
      <nav className="omx-guide-toolbar" aria-label="Assembly guide views">
        <Link to="/docs/systems/omx/introduction" className="omx-guide-back">
          ← OMX
        </Link>
        <div className="omx-guide-views">
          <button
            type="button"
            aria-pressed={view === "prepare"}
            onClick={() => navigate("prepare")}
          >
            Before you begin
          </button>
          <button
            type="button"
            aria-pressed={view === "3d"}
            onClick={() =>
              navigate("3d", { ...chosen, step: chosen.step ?? 1 })
            }
          >
            3D assembly
          </button>
          <button
            type="button"
            aria-pressed={view === "videos"}
            onClick={() => navigate("videos")}
          >
            Videos
          </button>
        </div>
      </nav>

      {view === "3d" ? (
        <iframe
          ref={frame}
          src={frameSource || undefined}
          className="omx-guide-frame"
          title={`OMX ${title} interactive assembly`}
          allow="clipboard-write; fullscreen"
          allowFullScreen
        />
      ) : (
        <div className="omx-guide-content">
          <header className="omx-guide-intro">
            <p className="omx-guide-eyebrow">OMX / ASSEMBLY GUIDE</p>
            <h1>
              {view === "prepare"
                ? "Build with a clear view."
                : "Assembly videos"}
            </h1>
            <p>
              {view === "prepare"
                ? "Choose your arm, check the actuator setup, and follow each connection in 3D."
                : "Legacy reference · Original assembly and cable routing demonstrations."}
            </p>
          </header>
          <div
            className="omx-guide-selection"
            role="group"
            aria-label="Choose your arm"
          >
            {(["leader", "follower"] as const).map((model) => (
              <button
                key={model}
                type="button"
                aria-pressed={chosen.model === model}
                onClick={() => {
                  choose({ ...chosen, model, step: undefined });
                }}
              >
                <strong>{model === "leader" ? "Leader" : "Follower"}</strong>
                <span>
                  {model === "leader"
                    ? "OMX-L · Teleoperation input"
                    : "OMX-F · Manipulator"}
                </span>
              </button>
            ))}
          </div>
          {view === "prepare" && chosen.model === "follower" && (
            <fieldset className="omx-guide-converters">
              <legend>Which DC converter is in your kit?</legend>
              <p>
                Match the board by its connectors. This changes the upper link
                and converter steps.
              </p>
              <div className="omx-guide-converter-cards">
                {(
                  [
                    {
                      value: "bic30",
                      title: "BIC30",
                      detail: "White TTL sockets",
                      image: "converter-bic30.webp",
                    },
                    {
                      value: "xl4015",
                      title: "XL4015",
                      detail: "Screw terminals · original kit",
                      image: "converter-xl4015.webp",
                    },
                  ] as const
                ).map((board) => (
                  <label
                    key={board.value}
                    className={
                      chosen.converter === board.value ? "selected" : ""
                    }
                  >
                    <input
                      type="radio"
                      name="converter"
                      value={board.value}
                      checked={chosen.converter === board.value}
                      onChange={() =>
                        choose({
                          ...chosen,
                          converter: board.value,
                          step: undefined,
                        })
                      }
                    />
                    <img
                      src={`${imageBase}${board.image}`}
                      alt={`${board.title} converter with ${board.detail.toLowerCase()}`}
                      width="1200"
                      height="900"
                    />
                    <span>
                      <strong>{board.title}</strong>
                      <small>{board.detail}</small>
                    </span>
                  </label>
                ))}
              </div>
            </fieldset>
          )}

          {view === "prepare" ? (
            <>
              <div className="omx-guide-preparation">
                <section className="omx-guide-panel">
                  <h2>01 / Check actuator IDs</h2>
                  <p>
                    Actuator IDs are preset before shipping. Match each actuator
                    to the ID shown for its joint; no initial ID setup is
                    needed.
                  </p>
                  <table>
                    <thead>
                      <tr>
                        <th scope="col">Joint</th>
                        <th scope="col">Actuator</th>
                        <th scope="col">ID</th>
                      </tr>
                    </thead>
                    <tbody>
                      {Array.from({ length: 6 }, (_, index) => (
                        <tr key={index}>
                          <td>{index + 1}</td>
                          <td>
                            {chosen.model === "leader"
                              ? index === 5
                                ? "XL330-M077"
                                : "XL330-M288"
                              : index < 3
                                ? "XL430-W250-T"
                                : "XL330-M288"}
                          </td>
                          <td>
                            {index + (chosen.model === "leader" ? 1 : 11)}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                  <Link to="/docs/systems/omx/quick_start_guide/setup_guide/">
                    Continue to software setup →
                  </Link>
                </section>
                <section className="omx-guide-panel">
                  <h2>02 / Check the reference posture</h2>
                  <p>
                    Set all joints to the initial position (180°). Align the
                    horn reference marks before fitting the frames.
                  </p>
                  <img
                    className="omx-guide-posture"
                    src={`${imageBase}omx_${chosen.model === "leader" ? "l" : "f"}_initial.webp`}
                    alt={`OMX ${title} reference posture with all joints at the initial position (180 degrees)`}
                  />
                </section>
              </div>
              <details className="omx-guide-details">
                <summary>Horn orientation, camera and finishing</summary>
                <div className="omx-guide-detail-grid">
                  <section>
                    <h3>Horn orientation</h3>
                    <p>
                      Align the single horn mark with the housing mark. The paired marks face the opposite side.
                    </p>
                    <a
                      href={`${imageBase}horn-alignment.webp`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="omx-guide-horn-link"
                    >
                      <img
                        src={`${imageBase}horn-alignment.webp`}
                        alt="XL330 and XL430 horn reference marks aligned with the housing reference marks, with enlarged details"
                        width="2400"
                        height="1480"
                        loading="lazy"
                      />
                      <span>View full-size alignment guide ↗</span>
                    </a>
                  </section>
                  <section>
                    <h3>Camera & grip surfaces</h3>
                    <p>
                      The camera is sold separately; its frame and mounting
                      bolts are included. See the external vendor link on the
                      ROBOTIS eShop product page.
                    </p>
                    <img
                      src={`${imageBase}camera_info.jpg`}
                      alt="Optional camera and included mounting hardware"
                      loading="lazy"
                    />
                    <p>Apply anti-slip tape to the gripper contact surfaces.</p>
                    <img
                      src={`${imageBase}anti-slip.jpg`}
                      alt="Anti-slip tape on the gripper contact surfaces"
                      loading="lazy"
                    />
                  </section>
                </div>
              </details>
              <div className="omx-guide-start">
                <p>
                  Disconnect power before connecting cables. Rotate, zoom and
                  inspect each connection as you assemble.
                </p>
                <button
                  type="button"
                  onClick={() =>
                    navigate("3d", { ...chosen, step: chosen.step ?? 1 })
                  }
                >
                  {chosen.step ? "Continue" : "Start"} {title} assembly →
                </button>
              </div>
            </>
          ) : (
            <section className="omx-guide-video-section">
              <p className="omx-guide-video-notice">
                These videos show the original kit. The cable and camera video
                uses the XL4015 converter. For BIC30 connections, use the
                matching{" "}
                <button
                  type="button"
                  onClick={() =>
                    navigate("3d", { ...chosen, step: chosen.step ?? 1 })
                  }
                >
                  3D assembly guide
                </button>
                .
              </p>
              <label className="omx-guide-video-select">
                {title} assembly chapter
                <select
                  value={clip}
                  onChange={(event) => setClip(Number(event.target.value))}
                >
                  {Array.from({ length: 6 }, (_, i) => (
                    <option value={i + 1} key={i}>
                      Chapter {i + 1}
                    </option>
                  ))}
                </select>
              </label>
              <video
                key={`${chosen.model}-${clip}`}
                controls
                preload="metadata"
                className="omx-guide-video"
              >
                <source
                  src={`${videoBase}omx_${chosen.model === "leader" ? "l" : "f"}/OMX-${chosen.model === "leader" ? "L" : "F"}_${clip}.mp4`}
                  type="video/mp4"
                />
                Your browser does not support embedded video.
              </video>
              <details className="omx-guide-details">
                <summary>Cable & camera assembly · XL4015</summary>
                <p>
                  <a
                    href="https://www.youtube.com/watch?v=mFXQkIDG69k"
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    Watch the original cable and camera assembly guide ↗
                  </a>
                </p>
              </details>
            </section>
          )}
        </div>
      )}
    </section>
  );
}
