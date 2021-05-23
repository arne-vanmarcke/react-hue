import React, { useState, useEffect } from 'react';
import ReactDOM from 'react-dom';
import './index.css';

//const _ip='10.198.120.60'
const username='QScScRGIUH581BZOxzAoTrW76rN38GfgXd9QIFyz'

/*setTimeout(()=>{
  let Nodediv= document.querySelectorAll('#onoff')
  div = Array.prototype.slice.call(Nodediv);
},50) */

function LampBox(props){
  return(
    <fieldset>
    <legend>Lamps</legend>
      <div className="lampBoxes">
        <Lamp name="1" ip={props.ip}/>
        <Lamp name="2" ip={props.ip}/>
        <Lamp name="3" ip={props.ip}/>
      </div>
    </fieldset>
  )
}

function Lamp(props){
  const [state, setState] = useState(false);
  const [color, setColor] = useState('#000000');
  const [brightness, setBrightness] = useState(0);

  useEffect(() => {
    setInterval(()=>{
      fetch('http://'+props.ip+'/api/'+username+'/lights')
      .then( res => res.json())
      .then(res => {
        console.log('part',res)
        let xy=res[props.name].state.xy
        let bri=res[props.name].state.bri
        setBrightness(bri)
        setColor(xyBriToRgb(xy[0],xy[1],bri))
        setState(res[props.name].state.on)
      })
    },2000)
  }, []);
  return(
    <React.Fragment>
    <div>
      <div className="lamp" id="box" onClick={()=>{
        if(brightness<=13){
          sendRequest(props.ip,props.name,true,null,128).then(res=>{})
          setState(true)
        }else{
          sendRequest(props.ip,props.name,!state,null,null).then(res=>{})
            setState(!state)
        }}
        }>
        <h2>{props.name}</h2>
        {state? <div className='box' style={{backgroundColor:color}}/>:<div className='box transparent'/>}
      </div>
      <div className="DetailBox">
        <p>detail lamp{props.name}</p>
        <input className='colorInput' type="color" value={color} onChange={(elem)=>{
          sendRequest(props.ip,props.name,null,rgbToXY(elem.target.value.replace('#','0x')),null)
        }}/>
        <input className="slider" type="range" min="0" max="255" value={brightness} onChange={(elem)=>{
          setBrightness(parseInt(elem.target.value))
          sendRequest(props.ip,props.name,null,null,parseInt(elem.target.value))
        }}/>
      </div>
    </div>
    </React.Fragment>
  )
}

ReactDOM.render(
  <LampBox ip="10.198.120.60"/>,
  document.getElementById('root')
);

function sendRequest(ip,num,toggle,color,bri){
  var body= new Object()
  if(toggle!=null){
    if(bri!= null)
      body={'on':toggle,'bri':128}
    else
      body={'on':toggle}
  }
  if(color!=null)
    body={'on':toggle,'xy':color}
  if(bri!=null)
  {
    if(bri<=13)
      body={'on':false,'bri':0}
    else
      body={'on':true,'bri':bri}
  }
  return new Promise((resolve,reject)=>{
    fetch('http://'+ip+'/api/'+username+'/lights/'+num+'/state',{
      method:'PUT',
      body:JSON.stringify(body),
      mode: "cors",
      headers: {
        'Content-Type': 'application/json'
      },
    })
    .then(res=>res.json())
    .then(res=>{ resolve(res)})
    .catch(err=>{reject(err)})
  })
}

function xyBriToRgb(x, y, bri){
  let z = 1.0 - x - y;
  let Y = bri / 255.0; // Brightness of lamp
  let X = (Y / y) * x;
  let Z = (Y / y) * z;
  let r = X * 1.612 - Y * 0.203 - Z * 0.302;
  let g = -X * 0.509 + Y * 1.412 + Z * 0.066;
  let b = X * 0.026 - Y * 0.072 + Z * 0.962;
  r = r <= 0.0031308 ? 12.92 * r : (1.0 + 0.055) * Math.pow(r, (1.0 / 2.4)) - 0.055;
  g = g <= 0.0031308 ? 12.92 * g : (1.0 + 0.055) * Math.pow(g, (1.0 / 2.4)) - 0.055;
  b = b <= 0.0031308 ? 12.92 * b : (1.0 + 0.055) * Math.pow(b, (1.0 / 2.4)) - 0.055;
  let maxValue = Math.max(r,g,b);
  r /= maxValue;
  g /= maxValue;
  b /= maxValue;
  r = r * 255;   if (r < 0) { r = 255 };
  g = g * 255;   if (g < 0) { g = 255 };
  b = b * 255;   if (b < 0) { b = 255 };
  r=Math.round(r)
  g=Math.round(g)
  b=Math.round(b)
  return '#'+r.toString(16)+g.toString(16)+b.toString(16)
  /*return {
      r :r,
      g :g,
      b :b
  }*/
}

function rgbToXY(color){
  let red = (color >> 16) / 255;
  let green = ((color >> 8) & 0xFF) / 255;
  let blue = (color & 0xFF) / 255;
  red = (red > 0.04045) ? Math.pow((red + 0.055) / (1.0 + 0.055), 2.4) : (red / 12.92);
  green = (green > 0.04045) ? Math.pow((green + 0.055) / (1.0 + 0.055), 2.4) : (green / 12.92);
  blue = (blue > 0.04045) ? Math.pow((blue + 0.055) / (1.0 + 0.055), 2.4) : (blue / 12.92);
  let X = red * 0.664511 + green * 0.154324 + blue * 0.162028;
  let Y = red * 0.283881 + green * 0.668433 + blue * 0.047685;
  let Z = red * 0.000088 + green * 0.072310 + blue * 0.986039;
  let x = X / (X + Y + Z);
  let y = Y / (X + Y + Z);
  return [x,y]
}
