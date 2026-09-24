import { getThemeCssVariables } from './applyCssVariables';

export function buildThemeInitScript(): string {
  const lightVars = getThemeCssVariables('light');
  const darkVars = getThemeCssVariables('dark');

  return `(function(){try{var m=localStorage.getItem('markos-theme');var d=(m==='light'||m==='dark')?m:'light';var light=${JSON.stringify(lightVars)};var dark=${JSON.stringify(darkVars)};var vars=d==='dark'?dark:light;var root=document.documentElement;root.dataset.theme=d;root.classList.toggle('dark',d==='dark');root.style.colorScheme=d;for(var k in vars){root.style.setProperty(k,vars[k]);}}catch(e){}})();`;
}
