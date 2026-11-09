// Idler retaining screws thread into the motor: too tight and the joint squeaks.
// Every other screw step fastens a 3D-printed frame: too tight and the frame can break.
export function screwCaution(step) {
  if (step.title === "Idler retaining screw") return "motor";
  if (/×|screw/i.test(step.part)) return "frame";
  return null;
}
