type Color = "red" | "teal" | "sky" | "blue";

type ColorShade = `${Color}-${number}0`;

export type TailwindColorBg = `bg-${ColorShade}`;

export type TailwindColorDivide = `divide-${ColorShade}`;
