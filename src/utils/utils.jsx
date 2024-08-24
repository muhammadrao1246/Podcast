import { ROUTES } from "src/routes"
// import teamPlaceholder from "src/assets/images/team_placeholder.svg";


import ColorThief from 'colorthief'
import tinycolor from "tinycolor2";

// HH:MM:SS:FF
export const TimeStampToSeconds = (stamp)=>{
  console.log(stamp)
  let {hours, minutes, seconds, frames} = stamp.split(":")
  let calc = (parseInt(hours) * 3600) + (parseInt(minutes) * 60) + parseInt(seconds) + (parseInt(frames) / 30)
  console.log(calc)
  return calc
}

export const DropboxSharedToDownloadableConverter=  (url)=>{
  return url.replace("https://www.dropbox.com/scl/fi/", "https://dl.dropboxusercontent.com/s/")
}

export const ButtonFilledOutlinedStyles = (backgroundColor, color, setOutlineHover = true)=>{
  return {
    backgroundColor: backgroundColor,
    border: `1.5px solid ${backgroundColor}`,
    color: color,
    "&:hover": setOutlineHover ? {
      backgroundColor: color,
      color: backgroundColor,
      border: `1.5px solid ${backgroundColor}`,
    } : {
      backgroundColor: backgroundColor,
      color: color,
      border: `1.5px solid ${backgroundColor}`,
    },
  };
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
