/*
 * Javascript -> SWF -> Javascript font detection.
 *
 * @author Gabriel Handford
 * @website http://rel.me
 * 
 * @see http://www.lalit.org/lab/javascript-css-font-detect
 */

var FontDetect = function(swfId, swfLocation, onReady) {
  this._swfId = swfId;
  this._swfObjectId = swfId;
  this._swfLocation = swfLocation;
  this._onReady = onReady;
  this._fallbackWidthCache = null;
  
  this.loadSWF();
}

var FontDetectGlobal = (function() {
  var instance = {};
  return {
    register: function(id, object) {
      instance[id] = object;
    },    
    remove: function(id) {
      var object = instance[id];
      instance[id] = null;
      return object;
    }
  };
})();

FontDetect.prototype = {
  
  loadSWF: function() {
    var flashvars = { onReady: "onFontDetectReady", swfObjectId: this._swfObjectId };
    var params = { allowScriptAccess: "always", menu: "false" };
    var attributes = { id: this._swfObjectId, name: this._swfObjectId };
    swfobject.embedSWF(this._swfLocation, this._swfId, "1", "1", "9.0.0", false, flashvars, params, attributes);    
    
    FontDetectGlobal.register(this._swfObjectId, this);
    
    $(document).bind('swfLoaded', function(event, id) {
      var fontDetect = FontDetectGlobal.remove(id);
      fontDetect._onReady(fontDetect);
    });
  },
  
  checkOffsetWidth: function(family, size) {
    var node = document.createElement("p");        
    $(node).css("font-family", "'" + family + "', Times New Roman");    
    $(node).css("font-size", size);
    $(node).css("display", "inline");
    $(node).addClass("font-test")
    
    // This was from http://www.lalit.org/lab/javascript-css-font-detect
    $(node).html("mmmmmmmmml"); // m or w take up max width
    $("body").append(node);
    var width = node.offsetWidth;
    $("body p.font-test").remove();
    return width;
  },

  fallbackWidth: function() {
    if (!this._fallbackWidthCache) this._fallbackWidthCache = this.checkOffsetWidth("Times New Roman", "120px");
    return this._fallbackWidthCache;
  },

  checkFont: function(family) {
    // We use Times New Roman as a fallback
    if (family == "Times New Roman") return true;    
  
    // Ignore fonts like: 'Arno Pro Semibold 18pt'
    if (/\d+pt\s*$/.test(family)) return false;
  
    var familyWidth = this.checkOffsetWidth("'" + family + "', Times New Roman", "120px");
    return (familyWidth != this.fallbackWidth());
  },
  
  filterFonts: function(fonts) {
    var filtered = []; 
    for (var i = 0, length = fonts.length; i < length; i++) {
      if (this.checkFont(fonts[i].fontName))
        filtered.push(fonts[i]);
    }
    return filtered;
  },
    
  fonts: function() {
    // Use when doing static publishing
    //var swf = swfobject.getObjectById(this._swfObjectId);
      
    // Works with dynamic publishing
    var swfElement = document.getElementById(this._swfObjectId);
    var fonts = swfElement.fonts();
    return this.filterFonts(fonts);
  }
  
};

// Callback for Flash
var onFontDetectReady = function(swfObjectId) {
  $(document).trigger('swfLoaded', [ swfObjectId ]);
};




/*
 jQuery Simple Slider

 Copyright (c) 2012 James Smith (http://loopj.com)

 Licensed under the MIT license (http://mit-license.org/)
*/
var __slice=[].slice,__indexOf=[].indexOf||function(e){for(var t=0,n=this.length;t<n;t++){if(t in this&&this[t]===e)return t}return-1};(function(e,t){var n;n=function(){function n(n,r){var i,s=this;this.input=n;this.defaultOptions={animate:true,snapMid:false,classPrefix:null,classSuffix:null,theme:null};this.settings=e.extend({},this.defaultOptions,r);if(this.settings.theme){this.settings.classSuffix="-"+this.settings.theme}this.input.hide();this.slider=e("<div>").addClass("slider"+(this.settings.classSuffix||"")).css({position:"relative",userSelect:"none",boxSizing:"border-box"}).insertBefore(this.input);if(this.input.attr("id")){this.slider.attr("id",this.input.attr("id")+"-slider")}this.track=e("<div>").addClass("track").css({position:"absolute",top:"50%",width:"100%",userSelect:"none",cursor:"pointer"}).appendTo(this.slider);this.dragger=e("<div>").addClass("dragger").css({position:"absolute",top:"50%",userSelect:"none",cursor:"pointer"}).appendTo(this.slider);this.slider.css({minHeight:this.dragger.outerHeight(),marginLeft:this.dragger.outerWidth()/2,marginRight:this.dragger.outerWidth()/2});this.track.css({marginTop:this.track.outerHeight()/-2});this.dragger.css({marginTop:this.dragger.outerWidth()/-2,marginLeft:this.dragger.outerWidth()/-2});this.track.mousedown(function(e){if(e.which!==1){return}s.domDrag(e.pageX,e.pageY,true);s.dragging=true;return false});this.dragger.mousedown(function(e){if(e.which!==1){return}s.dragging=true;s.dragger.addClass("dragging");s.domDrag(e.pageX,e.pageY);return false});e(t).mousemove(function(t){if(s.dragging){s.domDrag(t.pageX,t.pageY);return e("body").css({cursor:"pointer"})}}).mouseup(function(t){if(s.dragging){s.dragging=false;s.dragger.removeClass("dragging");return e("body").css({cursor:"auto"})}});this.pagePos=0;if(this.input.val()===""){this.value=this.getRange().min;this.input.val(this.value)}else{this.value=this.nearestValidValue(this.input.val())}this.setSliderPositionFromValue(this.value);i=this.valueToRatio(this.value);this.input.trigger("slider:ready",{value:this.value,ratio:i,position:i*this.slider.outerWidth(),el:this.slider})}n.prototype.setRatio=function(e){var t;e=Math.min(1,e);e=Math.max(0,e);t=this.ratioToValue(e);this.setSliderPositionFromValue(t);return this.valueChanged(t,e,"setRatio")};n.prototype.setValue=function(e){var t;e=this.nearestValidValue(e);t=this.valueToRatio(e);this.setSliderPositionFromValue(e);return this.valueChanged(e,t,"setValue")};n.prototype.domDrag=function(e,t,n){var r,i,s;if(n==null){n=false}r=e-this.slider.offset().left;r=Math.min(this.slider.outerWidth(),r);r=Math.max(0,r);if(this.pagePos!==r){this.pagePos=r;i=r/this.slider.outerWidth();s=this.ratioToValue(i);this.valueChanged(s,i,"domDrag");if(this.settings.snap){return this.setSliderPositionFromValue(s,n)}else{return this.setSliderPosition(r,n)}}};n.prototype.setSliderPosition=function(e,t){if(t==null){t=false}if(t&&this.settings.animate){return this.dragger.animate({left:e},200)}else{return this.dragger.css({left:e})}};n.prototype.setSliderPositionFromValue=function(e,t){var n;if(t==null){t=false}n=this.valueToRatio(e);return this.setSliderPosition(n*this.slider.outerWidth(),t)};n.prototype.getRange=function(){if(this.settings.allowedValues){return{min:Math.min.apply(Math,this.settings.allowedValues),max:Math.max.apply(Math,this.settings.allowedValues)}}else if(this.settings.range){return{min:parseFloat(this.settings.range[0]),max:parseFloat(this.settings.range[1])}}else{return{min:0,max:1}}};n.prototype.nearestValidValue=function(t){var n,r,i,s;i=this.getRange();t=Math.min(i.max,t);t=Math.max(i.min,t);if(this.settings.allowedValues){n=null;e.each(this.settings.allowedValues,function(){if(n===null||Math.abs(this-t)<Math.abs(n-t)){return n=this}});return n}else if(this.settings.step){r=(i.max-i.min)/this.settings.step;s=Math.floor((t-i.min)/this.settings.step);if((t-i.min)%this.settings.step>this.settings.step/2&&s<r){s+=1}return s*this.settings.step+i.min}else{return t}};n.prototype.valueToRatio=function(e){var t,n,r,i,s,o,u,a;if(this.settings.equalSteps){a=this.settings.allowedValues;for(i=o=0,u=a.length;o<u;i=++o){t=a[i];if(!(typeof n!=="undefined"&&n!==null)||Math.abs(t-e)<Math.abs(n-e)){n=t;r=i}}if(this.settings.snapMid){return(r+.5)/this.settings.allowedValues.length}else{return r/(this.settings.allowedValues.length-1)}}else{s=this.getRange();return(e-s.min)/(s.max-s.min)}};n.prototype.ratioToValue=function(e){var t,n,r,i,s;if(this.settings.equalSteps){s=this.settings.allowedValues.length;i=Math.round(e*s-.5);t=Math.min(i,this.settings.allowedValues.length-1);return this.settings.allowedValues[t]}else{n=this.getRange();r=e*(n.max-n.min)+n.min;return this.nearestValidValue(r)}};n.prototype.valueChanged=function(t,n,r){var i;if(t.toString()===this.value.toString()){return}this.value=t;i={value:t,ratio:n,position:n*this.slider.outerWidth(),trigger:r,el:this.slider};return this.input.val(t).trigger(e.Event("change",i)).trigger("slider:changed",i)};return n}();e.extend(e.fn,{simpleSlider:function(){var t,r,i;i=arguments[0],t=2<=arguments.length?__slice.call(arguments,1):[];r=["setRatio","setValue"];return e(this).each(function(){var s,o;if(i&&__indexOf.call(r,i)>=0){s=e(this).data("slider-object");return s[i].apply(s,t)}else{o=i;return e(this).data("slider-object",new n(e(this),o))}})}});return e(function(){return e("[data-slider]").each(function(){var t,n,r,i;t=e(this);r={};n=t.data("slider-values");if(n){r.allowedValues=function(){var e,t,r,s;r=n.split(",");s=[];for(e=0,t=r.length;e<t;e++){i=r[e];s.push(parseFloat(i))}return s}()}if(t.data("slider-range")){r.range=t.data("slider-range").split(",")}if(t.data("slider-step")){r.step=t.data("slider-step")}r.snap=t.data("slider-snap");r.equalSteps=t.data("slider-equal-steps");if(t.data("slider-theme")){r.theme=t.data("slider-theme")}return t.simpleSlider(r)})})})(this.jQuery||this.Zepto,this)



/*  SWFObject v2.0 <http://code.google.com/p/swfobject/>
  Copyright (c) 2007 Geoff Stearns, Michael Williams, and Bobby van der Sluis
  This software is released under the MIT License <http://www.opensource.org/licenses/mit-license.php>
*/
var swfobject=function(){var Z="undefined",P="object",B="Shockwave Flash",h="ShockwaveFlash.ShockwaveFlash",W="application/x-shockwave-flash",K="SWFObjectExprInst",G=window,g=document,N=navigator,f=[],H=[],Q=null,L=null,T=null,S=false,C=false;var a=function(){var l=typeof g.getElementById!=Z&&typeof g.getElementsByTagName!=Z&&typeof g.createElement!=Z&&typeof g.appendChild!=Z&&typeof g.replaceChild!=Z&&typeof g.removeChild!=Z&&typeof g.cloneNode!=Z,t=[0,0,0],n=null;if(typeof N.plugins!=Z&&typeof N.plugins[B]==P){n=N.plugins[B].description;if(n){n=n.replace(/^.*\s+(\S+\s+\S+$)/,"$1");t[0]=parseInt(n.replace(/^(.*)\..*$/,"$1"),10);t[1]=parseInt(n.replace(/^.*\.(.*)\s.*$/,"$1"),10);t[2]=/r/.test(n)?parseInt(n.replace(/^.*r(.*)$/,"$1"),10):0}}else{if(typeof G.ActiveXObject!=Z){var o=null,s=false;try{o=new ActiveXObject(h+".7")}catch(k){try{o=new ActiveXObject(h+".6");t=[6,0,21];o.AllowScriptAccess="always"}catch(k){if(t[0]==6){s=true}}if(!s){try{o=new ActiveXObject(h)}catch(k){}}}if(!s&&o){try{n=o.GetVariable("$version");if(n){n=n.split(" ")[1].split(",");t=[parseInt(n[0],10),parseInt(n[1],10),parseInt(n[2],10)]}}catch(k){}}}}var v=N.userAgent.toLowerCase(),j=N.platform.toLowerCase(),r=/webkit/.test(v)?parseFloat(v.replace(/^.*webkit\/(\d+(\.\d+)?).*$/,"$1")):false,i=false,q=j?/win/.test(j):/win/.test(v),m=j?/mac/.test(j):/mac/.test(v);/*@cc_on i=true;@if(@_win32)q=true;@elif(@_mac)m=true;@end@*/return{w3cdom:l,pv:t,webkit:r,ie:i,win:q,mac:m}}();var e=function(){if(!a.w3cdom){return }J(I);if(a.ie&&a.win){try{g.write("<script id=__ie_ondomload defer=true src=//:><\/script>");var i=c("__ie_ondomload");if(i){i.onreadystatechange=function(){if(this.readyState=="complete"){this.parentNode.removeChild(this);V()}}}}catch(j){}}if(a.webkit&&typeof g.readyState!=Z){Q=setInterval(function(){if(/loaded|complete/.test(g.readyState)){V()}},10)}if(typeof g.addEventListener!=Z){g.addEventListener("DOMContentLoaded",V,null)}M(V)}();function V(){if(S){return }if(a.ie&&a.win){var m=Y("span");try{var l=g.getElementsByTagName("body")[0].appendChild(m);l.parentNode.removeChild(l)}catch(n){return }}S=true;if(Q){clearInterval(Q);Q=null}var j=f.length;for(var k=0;k<j;k++){f[k]()}}function J(i){if(S){i()}else{f[f.length]=i}}function M(j){if(typeof G.addEventListener!=Z){G.addEventListener("load",j,false)}else{if(typeof g.addEventListener!=Z){g.addEventListener("load",j,false)}else{if(typeof G.attachEvent!=Z){G.attachEvent("onload",j)}else{if(typeof G.onload=="function"){var i=G.onload;G.onload=function(){i();j()}}else{G.onload=j}}}}}function I(){var l=H.length;for(var j=0;j<l;j++){var m=H[j].id;if(a.pv[0]>0){var k=c(m);if(k){H[j].width=k.getAttribute("width")?k.getAttribute("width"):"0";H[j].height=k.getAttribute("height")?k.getAttribute("height"):"0";if(O(H[j].swfVersion)){if(a.webkit&&a.webkit<312){U(k)}X(m,true)}else{if(H[j].expressInstall&&!C&&O("6.0.65")&&(a.win||a.mac)){D(H[j])}else{d(k)}}}}else{X(m,true)}}}function U(m){var k=m.getElementsByTagName(P)[0];if(k){var p=Y("embed"),r=k.attributes;if(r){var o=r.length;for(var n=0;n<o;n++){if(r[n].nodeName.toLowerCase()=="data"){p.setAttribute("src",r[n].nodeValue)}else{p.setAttribute(r[n].nodeName,r[n].nodeValue)}}}var q=k.childNodes;if(q){var s=q.length;for(var l=0;l<s;l++){if(q[l].nodeType==1&&q[l].nodeName.toLowerCase()=="param"){p.setAttribute(q[l].getAttribute("name"),q[l].getAttribute("value"))}}}m.parentNode.replaceChild(p,m)}}function F(i){if(a.ie&&a.win&&O("8.0.0")){G.attachEvent("onunload",function(){var k=c(i);if(k){for(var j in k){if(typeof k[j]=="function"){k[j]=function(){}}}k.parentNode.removeChild(k)}})}}function D(j){C=true;var o=c(j.id);if(o){if(j.altContentId){var l=c(j.altContentId);if(l){L=l;T=j.altContentId}}else{L=b(o)}if(!(/%$/.test(j.width))&&parseInt(j.width,10)<310){j.width="310"}if(!(/%$/.test(j.height))&&parseInt(j.height,10)<137){j.height="137"}g.title=g.title.slice(0,47)+" - Flash Player Installation";var n=a.ie&&a.win?"ActiveX":"PlugIn",k=g.title,m="MMredirectURL="+G.location+"&MMplayerType="+n+"&MMdoctitle="+k,p=j.id;if(a.ie&&a.win&&o.readyState!=4){var i=Y("div");p+="SWFObjectNew";i.setAttribute("id",p);o.parentNode.insertBefore(i,o);o.style.display="none";G.attachEvent("onload",function(){o.parentNode.removeChild(o)})}R({data:j.expressInstall,id:K,width:j.width,height:j.height},{flashvars:m},p)}}function d(j){if(a.ie&&a.win&&j.readyState!=4){var i=Y("div");j.parentNode.insertBefore(i,j);i.parentNode.replaceChild(b(j),i);j.style.display="none";G.attachEvent("onload",function(){j.parentNode.removeChild(j)})}else{j.parentNode.replaceChild(b(j),j)}}function b(n){var m=Y("div");if(a.win&&a.ie){m.innerHTML=n.innerHTML}else{var k=n.getElementsByTagName(P)[0];if(k){var o=k.childNodes;if(o){var j=o.length;for(var l=0;l<j;l++){if(!(o[l].nodeType==1&&o[l].nodeName.toLowerCase()=="param")&&!(o[l].nodeType==8)){m.appendChild(o[l].cloneNode(true))}}}}}return m}function R(AE,AC,q){var p,t=c(q);if(typeof AE.id==Z){AE.id=q}if(a.ie&&a.win){var AD="";for(var z in AE){if(AE[z]!=Object.prototype[z]){if(z=="data"){AC.movie=AE[z]}else{if(z.toLowerCase()=="styleclass"){AD+=' class="'+AE[z]+'"'}else{if(z!="classid"){AD+=" "+z+'="'+AE[z]+'"'}}}}}var AB="";for(var y in AC){if(AC[y]!=Object.prototype[y]){AB+='<param name="'+y+'" value="'+AC[y]+'" />'}}t.outerHTML='<object classid="clsid:D27CDB6E-AE6D-11cf-96B8-444553540000"'+AD+">"+AB+"</object>";F(AE.id);p=c(AE.id)}else{if(a.webkit&&a.webkit<312){var AA=Y("embed");AA.setAttribute("type",W);for(var x in AE){if(AE[x]!=Object.prototype[x]){if(x=="data"){AA.setAttribute("src",AE[x])}else{if(x.toLowerCase()=="styleclass"){AA.setAttribute("class",AE[x])}else{if(x!="classid"){AA.setAttribute(x,AE[x])}}}}}for(var w in AC){if(AC[w]!=Object.prototype[w]){if(w!="movie"){AA.setAttribute(w,AC[w])}}}t.parentNode.replaceChild(AA,t);p=AA}else{var s=Y(P);s.setAttribute("type",W);for(var v in AE){if(AE[v]!=Object.prototype[v]){if(v.toLowerCase()=="styleclass"){s.setAttribute("class",AE[v])}else{if(v!="classid"){s.setAttribute(v,AE[v])}}}}for(var u in AC){if(AC[u]!=Object.prototype[u]&&u!="movie"){E(s,u,AC[u])}}t.parentNode.replaceChild(s,t);p=s}}return p}function E(k,i,j){var l=Y("param");l.setAttribute("name",i);l.setAttribute("value",j);k.appendChild(l)}function c(i){return g.getElementById(i)}function Y(i){return g.createElement(i)}function O(k){var j=a.pv,i=k.split(".");i[0]=parseInt(i[0],10);i[1]=parseInt(i[1],10);i[2]=parseInt(i[2],10);return(j[0]>i[0]||(j[0]==i[0]&&j[1]>i[1])||(j[0]==i[0]&&j[1]==i[1]&&j[2]>=i[2]))?true:false}function A(m,j){if(a.ie&&a.mac){return }var l=g.getElementsByTagName("head")[0],k=Y("style");k.setAttribute("type","text/css");k.setAttribute("media","screen");if(!(a.ie&&a.win)&&typeof g.createTextNode!=Z){k.appendChild(g.createTextNode(m+" {"+j+"}"))}l.appendChild(k);if(a.ie&&a.win&&typeof g.styleSheets!=Z&&g.styleSheets.length>0){var i=g.styleSheets[g.styleSheets.length-1];if(typeof i.addRule==P){i.addRule(m,j)}}}function X(k,i){var j=i?"visible":"hidden";if(S){c(k).style.visibility=j}else{A("#"+k,"visibility:"+j)}}return{registerObject:function(l,i,k){if(!a.w3cdom||!l||!i){return }var j={};j.id=l;j.swfVersion=i;j.expressInstall=k?k:false;H[H.length]=j;X(l,false)},getObjectById:function(l){var i=null;if(a.w3cdom&&S){var j=c(l);if(j){var k=j.getElementsByTagName(P)[0];if(!k||(k&&typeof j.SetVariable!=Z)){i=j}else{if(typeof k.SetVariable!=Z){i=k}}}}return i},embedSWF:function(n,u,r,t,j,m,k,p,s){if(!a.w3cdom||!n||!u||!r||!t||!j){return }r+="";t+="";if(O(j)){X(u,false);var q=(typeof s==P)?s:{};q.data=n;q.width=r;q.height=t;var o=(typeof p==P)?p:{};if(typeof k==P){for(var l in k){if(k[l]!=Object.prototype[l]){if(typeof o.flashvars!=Z){o.flashvars+="&"+l+"="+k[l]}else{o.flashvars=l+"="+k[l]}}}}J(function(){R(q,o,u);if(q.id==u){X(u,true)}})}else{if(m&&!C&&O("6.0.65")&&(a.win||a.mac)){X(u,false);J(function(){var i={};i.id=i.altContentId=u;i.width=r;i.height=t;i.expressInstall=m;D(i)})}}},getFlashPlayerVersion:function(){return{major:a.pv[0],minor:a.pv[1],release:a.pv[2]}},hasFlashPlayerVersion:O,createSWF:function(k,j,i){if(a.w3cdom&&S){return R(k,j,i)}else{return undefined}},createCSS:function(j,i){if(a.w3cdom){A(j,i)}},addDomLoadEvent:J,addLoadEvent:M,getQueryParamValue:function(m){var l=g.location.search||g.location.hash;if(m==null){return l}if(l){var k=l.substring(1).split("&");for(var j=0;j<k.length;j++){if(k[j].substring(0,k[j].indexOf("="))==m){return k[j].substring((k[j].indexOf("=")+1))}}}return""},expressInstallCallback:function(){if(C&&L){var i=c(K);if(i){i.parentNode.replaceChild(L,i);if(T){X(T,true);if(a.ie&&a.win){L.style.display="block"}}L=null;T=null;C=false}}}}}();



/*!
 * jQuery Cookie Plugin v1.3
 * https://github.com/carhartl/jquery-cookie
 *
 * Copyright 2011, Klaus Hartl
 * Dual licensed under the MIT or GPL Version 2 licenses.
 * http://www.opensource.org/licenses/mit-license.php
 * http://www.opensource.org/licenses/GPL-2.0
 */
 (function(e,t,n){function i(e){return e}function s(e){return decodeURIComponent(e.replace(r," "))}var r=/\+/g;var o=e.cookie=function(r,u,a){if(u!==n){a=e.extend({},o.defaults,a);if(u===null){a.expires=-1}if(typeof a.expires==="number"){var f=a.expires,l=a.expires=new Date;l.setDate(l.getDate()+f)}u=o.json?JSON.stringify(u):String(u);return t.cookie=[encodeURIComponent(r),"=",o.raw?u:encodeURIComponent(u),a.expires?"; expires="+a.expires.toUTCString():"",a.path?"; path="+a.path:"",a.domain?"; domain="+a.domain:"",a.secure?"; secure":""].join("")}var c=o.raw?i:s;var h=t.cookie.split("; ");for(var p=0,d=h.length;p<d;p++){var v=h[p].split("=");if(c(v.shift())===r){var m=c(v.join("="));return o.json?JSON.parse(m):m}}return null};o.defaults={};e.removeCookie=function(t,n){if(e.cookie(t)!==null){e.cookie(t,null,n);return true}return false}})(jQuery,document)