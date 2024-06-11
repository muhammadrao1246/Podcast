import { ROUTES } from "src/routes/urls"
// import teamPlaceholder from "src/assets/images/team_placeholder.svg";


import ColorThief from 'colorthief'
import tinycolor from "tinycolor2";

export function RunRateStringMaker(runRates){
  let runRateNameMap = {
    "currentRunRate": "CRR",
    "requiredRunRate": "RRR",
    "runsRequired": "RR",
    "ballsRemaining": "BR"
  }
  return Object.keys(runRates).filter(key=>runRates[key] != null).map((key)=>{
    return runRateNameMap[key] + ": " + runRates[key]
  }).join(" • ")
}

// Utility
export const rgbToHex = (r, g, b) => {
  const values = [r, g, b].map((value) => {
    const hex = value.toString(16);
    return hex.length === 1 ? `0${hex}` : hex;
  });
  return `#${values.join('')}`;
};

export async function FindImageDominantColor(imageUrl) {
  try {
    let img = new Image();
    img.crossOrigin = 'Anonymous';
    img.src = imageUrl;

    await new Promise((resolve, reject) => {
      img.onload = () => resolve();
      img.onerror = reject;
    });

    let thief = new ColorThief();
    let color = thief.getColor(img);
    color = rgbToHex(color[0], color[1], color[2])

    // console.log('Dominant color:', color);
    return tinycolor(color).lighten(10).toHexString();
  } catch (error) {
    console.error('Error finding dominant color:', error);
    return "";
  }
}

export function FindDateStringLong(date) {  
  if (date != null) {
    date = new Date(date)
    return date.toLocaleDateString("en-US", {dateStyle:"long"}) 
  }
  return ""
}



export function FindGroundLongName(ground) {
  if (ground == null) {
    return "Ground Unknown"
  }
  return typeof ground != "string" ? ground.longName : ground;
}

export function FindGroundShortName(ground) {
  if (ground == null) {
    return "Ground Unknown"
  }
  return typeof ground != "string" ? ground.shortName != null ? ground.shortName : ground.longName : ground;
}

export function FindGroundProfile(ground) {
  return typeof ground != "string" && ground != null ? ROUTES.GROUNDS + "/" + ground.slug : "";
}

export function FindGroundImage(ground) {
  return typeof ground != "string" ? ground.image != null ? ground.image : "" : "";
}
