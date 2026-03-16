import type { ReactNode } from "react";

type PanelFrameProps = {
    children: ReactNode;
    className?: string;
    eyebrow: string;
    footer?: ReactNode;
    status: string;
    title: string;
};

// Gemensam panelram ger samma struktur i alla widgets utan att dölja för mycket logik.
export function PanelFrame(props: PanelFrameProps) {
    return (
        <section className={`panel ${props.className ?? ""}`.trim()}>
            <div className="panel-header">
                <div>
                    <p className="eyebrow">{props.eyebrow}</p>
                    <h2>{props.title}</h2>
                </div>

                <span className="status-pill">{props.status}</span>
            </div>

            {props.children}
            {props.footer}
        </section>
    );
}
