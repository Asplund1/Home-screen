// import { Box, Paper, Typography, Chip } from "@mui/material";
// import type { ReactNode } from "react";
// import type { SxProps, Theme } from "@mui/material/styles";

// type PanelFrameProps = {
//   children: ReactNode;
//   className?: string;
//   eyebrow: string;
//   footer?: ReactNode;
//   status: string;
//   title: string;
//   sx?: SxProps<Theme>;
// };

// // Gemensam panelram ger samma struktur i alla widgets utan att dölja för mycket logik.
// export function PanelFrame(props: PanelFrameProps) {
//   return (
//     <Paper
//       sx={{
//         display: "grid",
//         padding: 3,
//         borderRadius: "1.6rem",
//         minHeight: 0,
//         ...(props.className && {
//           ...(props.className.includes("panel-clock") && {
//             display: "grid",
//             height: "100%",
//             placeItems: "center",
//           }),
//           ...(props.className.includes("panel-weather") && {
//             minHeight: 0,
//           }),
//         }),
//         ...props.sx,
//       }}
//     >
//       <Box
//         sx={{
//           display: "flex",
//           alignItems: "start",
//           justifyContent: "space-between",
//           gap: 1,
//         }}
//       >
//         <Box>
//           <Typography variant="h5" sx={{}}>
//             {props.title}
//           </Typography>
//         </Box>

//         {props.status ? (
//           <Chip
//             label={props.status}
//             sx={{
//               background: "rgba(15, 172, 122, 0.08)",
//               fontSize: "1rem",
//               fontWeight: 700,
//             }}
//           />
//         ) : null}
//       </Box>

//       {props.children}
//       {props.footer}
//     </Paper>
//   );
// }
