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








/*!
 * jQuery blockUI plugin
 * Version 2.54 (17-DEC-2012)
 * @requires jQuery v1.3 or later
 *
 * Examples at: http://malsup.com/jquery/block/
 * Copyright (c) 2007-2012 M. Alsup
 * Dual licensed under the MIT and GPL licenses:
 * http://www.opensource.org/licenses/mit-license.php
 * http://www.gnu.org/licenses/gpl.html
 *
 * Thanks to Amir-Hossein Sobhi for some excellent contributions!
 */

;(function() {
"use strict";

  function setup($) {
    if (/^1\.(0|1|2)/.test($.fn.jquery)) {
      /*global alert:true */
      alert('blockUI requires jQuery v1.3 or later!  You are using v' + $.fn.jquery);
      return;
    }

    $.fn._fadeIn = $.fn.fadeIn;

    var noOp = $.noop || function() {};

    // this bit is to ensure we don't call setExpression when we shouldn't (with extra muscle to handle
    // retarded userAgent strings on Vista)
    var msie = /MSIE/.test(navigator.userAgent);
    var ie6  = /MSIE 6.0/.test(navigator.userAgent);
    var mode = document.documentMode || 0;
    // var setExpr = msie && (($.browser.version < 8 && !mode) || mode < 8);
    var setExpr = $.isFunction( document.createElement('div').style.setExpression );

    // global $ methods for blocking/unblocking the entire page
    $.blockUI   = function(opts) { install(window, opts); };
    $.unblockUI = function(opts) { remove(window, opts); };

    // convenience method for quick growl-like notifications  (http://www.google.com/search?q=growl)
    $.growlUI = function(title, message, timeout, onClose) {
      var $m = $('<div class="growlUI"></div>');
      if (title) $m.append('<h1>'+title+'</h1>');
      if (message) $m.append('<h2>'+message+'</h2>');
      if (timeout === undefined) timeout = 3000;
      $.blockUI({
        message: $m, fadeIn: 700, fadeOut: 1000, centerY: false,
        timeout: timeout, showOverlay: false,
        onUnblock: onClose,
        css: $.blockUI.defaults.growlCSS
      });
    };

    // plugin method for blocking element content
    $.fn.block = function(opts) {
      var fullOpts = $.extend({}, $.blockUI.defaults, opts || {});
      this.each(function() {
        var $el = $(this);
        if (fullOpts.ignoreIfBlocked && $el.data('blockUI.isBlocked'))
          return;
        $el.unblock({ fadeOut: 0 });
      });

      return this.each(function() {
        if ($.css(this,'position') == 'static')
          this.style.position = 'relative';
        this.style.zoom = 1; // force 'hasLayout' in ie
        install(this, opts);
      });
    };

    // plugin method for unblocking element content
    $.fn.unblock = function(opts) {
      return this.each(function() {
        remove(this, opts);
      });
    };

    $.blockUI.version = 2.54; // 2nd generation blocking at no extra cost!

    // override these in your code to change the default behavior and style
    $.blockUI.defaults = {
      // message displayed when blocking (use null for no message)
      message:  null,

      title: null,    // title string; only used when theme == true
      draggable: true,  // only used when theme == true (requires jquery-ui.js to be loaded)

      theme: false, // set to true to use with jQuery UI themes

      // styles for the message when blocking; if you wish to disable
      // these and use an external stylesheet then do this in your code:
      // $.blockUI.defaults.css = {};
      css: {
        padding:  14,
        margin:   0,
        width:    '34%',
        top:    '40%',
        left:   '33%',
        textAlign:  'center',
        color:    '#000',
        backgroundColor:'#fff',
        cursor:   'wait'
      },

      // minimal style set used when themes are used
      themedCSS: {
        width:  '30%',
        top:  '40%',
        left: '35%'
      },

      // styles for the overlay
      overlayCSS:  {
        backgroundColor:  '#000',
        opacity:      0.6,
        cursor:       'wait'
      },

      // style to replace wait cursor before unblocking to correct issue
      // of lingering wait cursor
      cursorReset: 'default',

      // styles applied when using $.growlUI
      growlCSS: {
        width:    '350px',
        top:    '10px',
        left:   '',
        right:    '10px',
        border:   'none',
        padding:  '5px',
        opacity:  0.6,
        cursor:   'default',
        color:    '#fff',
        backgroundColor: '#000',
        '-webkit-border-radius':'10px',
        '-moz-border-radius': '10px',
        'border-radius':    '10px'
      },

      // IE issues: 'about:blank' fails on HTTPS and javascript:false is s-l-o-w
      // (hat tip to Jorge H. N. de Vasconcelos)
      /*jshint scripturl:true */
      iframeSrc: /^https/i.test(window.location.href || '') ? 'javascript:false' : 'about:blank',

      // force usage of iframe in non-IE browsers (handy for blocking applets)
      forceIframe: false,

      // z-index for the blocking overlay
      baseZ: 1000,

      // set these to true to have the message automatically centered
      centerX: true, // <-- only effects element blocking (page block controlled via css above)
      centerY: true,

      // allow body element to be stetched in ie6; this makes blocking look better
      // on "short" pages.  disable if you wish to prevent changes to the body height
      allowBodyStretch: true,

      // enable if you want key and mouse events to be disabled for content that is blocked
      bindEvents: true,

      // be default blockUI will supress tab navigation from leaving blocking content
      // (if bindEvents is true)
      constrainTabKey: true,

      // fadeIn time in millis; set to 0 to disable fadeIn on block
      fadeIn:  200,

      // fadeOut time in millis; set to 0 to disable fadeOut on unblock
      fadeOut:  400,

      // time in millis to wait before auto-unblocking; set to 0 to disable auto-unblock
      timeout: 0,

      // disable if you don't want to show the overlay
      showOverlay: true,

      // if true, focus will be placed in the first available input field when
      // page blocking
      focusInput: true,

      // suppresses the use of overlay styles on FF/Linux (due to performance issues with opacity)
      // no longer needed in 2012
      // applyPlatformOpacityRules: true,

      // callback method invoked when fadeIn has completed and blocking message is visible
      onBlock: null,

      // callback method invoked when unblocking has completed; the callback is
      // passed the element that has been unblocked (which is the window object for page
      // blocks) and the options that were passed to the unblock call:
      //  onUnblock(element, options)
      onUnblock: null,

      // callback method invoked when the overlay area is clicked.
      // setting this will turn the cursor to a pointer, otherwise cursor defined in overlayCss will be used.
      onOverlayClick: null,

      // don't ask; if you really must know: http://groups.google.com/group/jquery-en/browse_thread/thread/36640a8730503595/2f6a79a77a78e493#2f6a79a77a78e493
      quirksmodeOffsetHack: 4,

      // class name of the message block
      blockMsgClass: 'blockMsg',

      // if it is already blocked, then ignore it (don't unblock and reblock)
      ignoreIfBlocked: false
    };

    // private data and functions follow...

    var pageBlock = null;
    var pageBlockEls = [];

    function install(el, opts) {
      var css, themedCSS;
      var full = (el == window);
      var msg = (opts && opts.message !== undefined ? opts.message : undefined);
      opts = $.extend({}, $.blockUI.defaults, opts || {});

      if (opts.ignoreIfBlocked && $(el).data('blockUI.isBlocked'))
        return;

      opts.overlayCSS = $.extend({}, $.blockUI.defaults.overlayCSS, opts.overlayCSS || {});
      css = $.extend({}, $.blockUI.defaults.css, opts.css || {});
      if (opts.onOverlayClick)
        opts.overlayCSS.cursor = 'pointer';

      themedCSS = $.extend({}, $.blockUI.defaults.themedCSS, opts.themedCSS || {});
      msg = msg === undefined ? opts.message : msg;

      // remove the current block (if there is one)
      if (full && pageBlock)
        remove(window, {fadeOut:0});

      // if an existing element is being used as the blocking content then we capture
      // its current place in the DOM (and current display style) so we can restore
      // it when we unblock
      if (msg && typeof msg != 'string' && (msg.parentNode || msg.jquery)) {
        var node = msg.jquery ? msg[0] : msg;
        var data = {};
        $(el).data('blockUI.history', data);
        data.el = node;
        data.parent = node.parentNode;
        data.display = node.style.display;
        data.position = node.style.position;
        if (data.parent)
          data.parent.removeChild(node);
      }

      $(el).data('blockUI.onUnblock', opts.onUnblock);
      var z = opts.baseZ;

      // blockUI uses 3 layers for blocking, for simplicity they are all used on every platform;
      // layer1 is the iframe layer which is used to supress bleed through of underlying content
      // layer2 is the overlay layer which has opacity and a wait cursor (by default)
      // layer3 is the message content that is displayed while blocking
      var lyr1, lyr2, lyr3, s;
      if (msie || opts.forceIframe)
        lyr1 = $('<iframe class="blockUI" style="z-index:'+ (z++) +';display:none;border:none;margin:0;padding:0;position:absolute;width:100%;height:100%;top:0;left:0" src="'+opts.iframeSrc+'"></iframe>');
      else
        lyr1 = $('<div class="blockUI" style="display:none"></div>');

      if (opts.theme)
        lyr2 = $('<div class="blockUI blockOverlay ui-widget-overlay" style="z-index:'+ (z++) +';display:none"></div>');
      else
        lyr2 = $('<div class="blockUI blockOverlay" style="z-index:'+ (z++) +';display:none;border:none;margin:0;padding:0;width:100%;height:100%;top:0;left:0"></div>');

      if (opts.theme && full) {
        s = '<div class="blockUI ' + opts.blockMsgClass + ' blockPage ui-dialog ui-widget ui-corner-all" style="z-index:'+(z+10)+';display:none;position:fixed">';
        if ( opts.title ) {
          s += '<div class="ui-widget-header ui-dialog-titlebar ui-corner-all blockTitle">'+(opts.title || '&nbsp;')+'</div>';
        }
        s += '<div class="ui-widget-content ui-dialog-content"></div>';
        s += '</div>';
      }
      else if (opts.theme) {
        s = '<div class="blockUI ' + opts.blockMsgClass + ' blockElement ui-dialog ui-widget ui-corner-all" style="z-index:'+(z+10)+';display:none;position:absolute">';
        if ( opts.title ) {
          s += '<div class="ui-widget-header ui-dialog-titlebar ui-corner-all blockTitle">'+(opts.title || '&nbsp;')+'</div>';
        }  
        s += '<div class="ui-widget-content ui-dialog-content"></div>';
        s += '</div>';
      }
      else if (full) {
        s = '<div class="blockUI ' + opts.blockMsgClass + ' blockPage" style="z-index:'+(z+10)+';display:none;position:fixed"></div>';
      }
      else {
        s = '<div class="blockUI ' + opts.blockMsgClass + ' blockElement" style="z-index:'+(z+10)+';display:none;position:absolute"></div>';
      }
      lyr3 = $(s);

      // if we have a message, style it
      if (msg) {
        if (opts.theme) {
          lyr3.css(themedCSS);
          lyr3.addClass('ui-widget-content');
        }
        else
          lyr3.css(css);
      }

      // style the overlay
      if (!opts.theme /*&& (!opts.applyPlatformOpacityRules)*/)
        lyr2.css(opts.overlayCSS);
      lyr2.css('position', full ? 'fixed' : 'absolute');

      // make iframe layer transparent in IE
      if (msie || opts.forceIframe)
        lyr1.css('opacity',0.0);

      //$([lyr1[0],lyr2[0],lyr3[0]]).appendTo(full ? 'body' : el);
      var layers = [lyr1,lyr2,lyr3], $par = full ? $('body') : $(el);
      $.each(layers, function() {
        this.appendTo($par);
      });

      if (opts.theme && opts.draggable && $.fn.draggable) {
        lyr3.draggable({
          handle: '.ui-dialog-titlebar',
          cancel: 'li'
        });
      }

      // ie7 must use absolute positioning in quirks mode and to account for activex issues (when scrolling)
      var expr = setExpr && (!$.support.boxModel || $('object,embed', full ? null : el).length > 0);
      if (ie6 || expr) {
        // give body 100% height
        if (full && opts.allowBodyStretch && $.support.boxModel)
          $('html,body').css('height','100%');

        // fix ie6 issue when blocked element has a border width
        if ((ie6 || !$.support.boxModel) && !full) {
          var t = sz(el,'borderTopWidth'), l = sz(el,'borderLeftWidth');
          var fixT = t ? '(0 - '+t+')' : 0;
          var fixL = l ? '(0 - '+l+')' : 0;
        }

        // simulate fixed position
        $.each(layers, function(i,o) {
          var s = o[0].style;
          s.position = 'absolute';
          if (i < 2) {
            if (full)
              s.setExpression('height','Math.max(document.body.scrollHeight, document.body.offsetHeight) - (jQuery.support.boxModel?0:'+opts.quirksmodeOffsetHack+') + "px"');
            else
              s.setExpression('height','this.parentNode.offsetHeight + "px"');
            if (full)
              s.setExpression('width','jQuery.support.boxModel && document.documentElement.clientWidth || document.body.clientWidth + "px"');
            else
              s.setExpression('width','this.parentNode.offsetWidth + "px"');
            if (fixL) s.setExpression('left', fixL);
            if (fixT) s.setExpression('top', fixT);
          }
          else if (opts.centerY) {
            if (full) s.setExpression('top','(document.documentElement.clientHeight || document.body.clientHeight) / 2 - (this.offsetHeight / 2) + (blah = document.documentElement.scrollTop ? document.documentElement.scrollTop : document.body.scrollTop) + "px"');
            s.marginTop = 0;
          }
          else if (!opts.centerY && full) {
            var top = (opts.css && opts.css.top) ? parseInt(opts.css.top, 10) : 0;
            var expression = '((document.documentElement.scrollTop ? document.documentElement.scrollTop : document.body.scrollTop) + '+top+') + "px"';
            s.setExpression('top',expression);
          }
        });
      }

      // show the message
      if (msg) {
        if (opts.theme)
          lyr3.find('.ui-widget-content').append(msg);
        else
          lyr3.append(msg);
        if (msg.jquery || msg.nodeType)
          $(msg).show();
      }

      if ((msie || opts.forceIframe) && opts.showOverlay)
        lyr1.show(); // opacity is zero
      if (opts.fadeIn) {
        var cb = opts.onBlock ? opts.onBlock : noOp;
        var cb1 = (opts.showOverlay && !msg) ? cb : noOp;
        var cb2 = msg ? cb : noOp;
        if (opts.showOverlay)
          lyr2._fadeIn(opts.fadeIn, cb1);
        if (msg)
          lyr3._fadeIn(opts.fadeIn, cb2);
      }
      else {
        if (opts.showOverlay)
          lyr2.show();
        if (msg)
          lyr3.show();
        if (opts.onBlock)
          opts.onBlock();
      }

      // bind key and mouse events
      bind(1, el, opts);

      if (full) {
        pageBlock = lyr3[0];
        pageBlockEls = $(':input:enabled:visible',pageBlock);
        if (opts.focusInput)
          setTimeout(focus, 20);
      }
      else
        center(lyr3[0], opts.centerX, opts.centerY);

      if (opts.timeout) {
        // auto-unblock
        var to = setTimeout(function() {
          if (full)
            $.unblockUI(opts);
          else
            $(el).unblock(opts);
        }, opts.timeout);
        $(el).data('blockUI.timeout', to);
      }
    }

    // remove the block
    function remove(el, opts) {
      var full = (el == window);
      var $el = $(el);
      var data = $el.data('blockUI.history');
      var to = $el.data('blockUI.timeout');
      if (to) {
        clearTimeout(to);
        $el.removeData('blockUI.timeout');
      }
      opts = $.extend({}, $.blockUI.defaults, opts || {});
      bind(0, el, opts); // unbind events

      if (opts.onUnblock === null) {
        opts.onUnblock = $el.data('blockUI.onUnblock');
        $el.removeData('blockUI.onUnblock');
      }

      var els;
      if (full) // crazy selector to handle odd field errors in ie6/7
        els = $('body').children().filter('.blockUI').add('body > .blockUI');
      else
        els = $el.find('>.blockUI');

      // fix cursor issue
      if ( opts.cursorReset ) {
        if ( els.length > 1 )
          els[1].style.cursor = opts.cursorReset;
        if ( els.length > 2 )
          els[2].style.cursor = opts.cursorReset;
      }

      if (full)
        pageBlock = pageBlockEls = null;

      if (opts.fadeOut) {
        els.fadeOut(opts.fadeOut);
        setTimeout(function() { reset(els,data,opts,el); }, opts.fadeOut);
      }
      else
        reset(els, data, opts, el);
    }

    // move blocking element back into the DOM where it started
    function reset(els,data,opts,el) {
      els.each(function(i,o) {
        // remove via DOM calls so we don't lose event handlers
        if (this.parentNode)
          this.parentNode.removeChild(this);
      });

      if (data && data.el) {
        data.el.style.display = data.display;
        data.el.style.position = data.position;
        if (data.parent)
          data.parent.appendChild(data.el);
        $(el).removeData('blockUI.history');
      }

      if (typeof opts.onUnblock == 'function')
        opts.onUnblock(el,opts);

      // fix issue in Safari 6 where block artifacts remain until reflow
      var body = $(document.body), w = body.width(), cssW = body[0].style.width;
      body.width(w-1).width(w);
      body[0].style.width = cssW;
    }

    // bind/unbind the handler
    function bind(b, el, opts) {
      var full = el == window, $el = $(el);

      // don't bother unbinding if there is nothing to unbind
      if (!b && (full && !pageBlock || !full && !$el.data('blockUI.isBlocked')))
        return;

      $el.data('blockUI.isBlocked', b);

      // don't bind events when overlay is not in use or if bindEvents is false
      if (!opts.bindEvents || (b && !opts.showOverlay))
        return;

      // bind anchors and inputs for mouse and key events
      var events = 'mousedown mouseup keydown keypress keyup touchstart touchend touchmove';
      if (b)
        $(document).bind(events, opts, handler);
      else
        $(document).unbind(events, handler);

    // former impl...
    //    var $e = $('a,:input');
    //    b ? $e.bind(events, opts, handler) : $e.unbind(events, handler);
    }

    // event handler to suppress keyboard/mouse events when blocking
    function handler(e) {
      // allow tab navigation (conditionally)
      if (e.keyCode && e.keyCode == 9) {
        if (pageBlock && e.data.constrainTabKey) {
          var els = pageBlockEls;
          var fwd = !e.shiftKey && e.target === els[els.length-1];
          var back = e.shiftKey && e.target === els[0];
          if (fwd || back) {
            setTimeout(function(){focus(back);},10);
            return false;
          }
        }
      }
      var opts = e.data;
      var target = $(e.target);
      if (target.hasClass('blockOverlay') && opts.onOverlayClick)
        opts.onOverlayClick();

      // allow events within the message content
      if (target.parents('div.' + opts.blockMsgClass).length > 0)
        return true;

      // allow events for content that is not being blocked
      return target.parents().children().filter('div.blockUI').length === 0;
    }

    function focus(back) {
      if (!pageBlockEls)
        return;
      var e = pageBlockEls[back===true ? pageBlockEls.length-1 : 0];
      if (e)
        e.focus();
    }

    function center(el, x, y) {
      var p = el.parentNode, s = el.style;
      var l = ((p.offsetWidth - el.offsetWidth)/2) - sz(p,'borderLeftWidth');
      var t = ((p.offsetHeight - el.offsetHeight)/2) - sz(p,'borderTopWidth');
      if (x) s.left = l > 0 ? (l+'px') : '0';
      if (y) s.top  = t > 0 ? (t+'px') : '0';
    }

    function sz(el, p) {
      return parseInt($.css(el,p),10)||0;
    }

  }


  /*global define:true */
  if (typeof define === 'function' && define.amd && define.amd.jQuery) {
    define(['jquery'], setup);
  } else {
    setup(jQuery);
  }

})();




/*  SWFObject v2.0 <http://code.google.com/p/swfobject/>
  Copyright (c) 2007 Geoff Stearns, Michael Williams, and Bobby van der Sluis
  This software is released under the MIT License <http://www.opensource.org/licenses/mit-license.php>
*/
var swfobject=function(){var Z="undefined",P="object",B="Shockwave Flash",h="ShockwaveFlash.ShockwaveFlash",W="application/x-shockwave-flash",K="SWFObjectExprInst",G=window,g=document,N=navigator,f=[],H=[],Q=null,L=null,T=null,S=false,C=false;var a=function(){var l=typeof g.getElementById!=Z&&typeof g.getElementsByTagName!=Z&&typeof g.createElement!=Z&&typeof g.appendChild!=Z&&typeof g.replaceChild!=Z&&typeof g.removeChild!=Z&&typeof g.cloneNode!=Z,t=[0,0,0],n=null;if(typeof N.plugins!=Z&&typeof N.plugins[B]==P){n=N.plugins[B].description;if(n){n=n.replace(/^.*\s+(\S+\s+\S+$)/,"$1");t[0]=parseInt(n.replace(/^(.*)\..*$/,"$1"),10);t[1]=parseInt(n.replace(/^.*\.(.*)\s.*$/,"$1"),10);t[2]=/r/.test(n)?parseInt(n.replace(/^.*r(.*)$/,"$1"),10):0}}else{if(typeof G.ActiveXObject!=Z){var o=null,s=false;try{o=new ActiveXObject(h+".7")}catch(k){try{o=new ActiveXObject(h+".6");t=[6,0,21];o.AllowScriptAccess="always"}catch(k){if(t[0]==6){s=true}}if(!s){try{o=new ActiveXObject(h)}catch(k){}}}if(!s&&o){try{n=o.GetVariable("$version");if(n){n=n.split(" ")[1].split(",");t=[parseInt(n[0],10),parseInt(n[1],10),parseInt(n[2],10)]}}catch(k){}}}}var v=N.userAgent.toLowerCase(),j=N.platform.toLowerCase(),r=/webkit/.test(v)?parseFloat(v.replace(/^.*webkit\/(\d+(\.\d+)?).*$/,"$1")):false,i=false,q=j?/win/.test(j):/win/.test(v),m=j?/mac/.test(j):/mac/.test(v);/*@cc_on i=true;@if(@_win32)q=true;@elif(@_mac)m=true;@end@*/return{w3cdom:l,pv:t,webkit:r,ie:i,win:q,mac:m}}();var e=function(){if(!a.w3cdom){return }J(I);if(a.ie&&a.win){try{g.write("<script id=__ie_ondomload defer=true src=//:><\/script>");var i=c("__ie_ondomload");if(i){i.onreadystatechange=function(){if(this.readyState=="complete"){this.parentNode.removeChild(this);V()}}}}catch(j){}}if(a.webkit&&typeof g.readyState!=Z){Q=setInterval(function(){if(/loaded|complete/.test(g.readyState)){V()}},10)}if(typeof g.addEventListener!=Z){g.addEventListener("DOMContentLoaded",V,null)}M(V)}();function V(){if(S){return }if(a.ie&&a.win){var m=Y("span");try{var l=g.getElementsByTagName("body")[0].appendChild(m);l.parentNode.removeChild(l)}catch(n){return }}S=true;if(Q){clearInterval(Q);Q=null}var j=f.length;for(var k=0;k<j;k++){f[k]()}}function J(i){if(S){i()}else{f[f.length]=i}}function M(j){if(typeof G.addEventListener!=Z){G.addEventListener("load",j,false)}else{if(typeof g.addEventListener!=Z){g.addEventListener("load",j,false)}else{if(typeof G.attachEvent!=Z){G.attachEvent("onload",j)}else{if(typeof G.onload=="function"){var i=G.onload;G.onload=function(){i();j()}}else{G.onload=j}}}}}function I(){var l=H.length;for(var j=0;j<l;j++){var m=H[j].id;if(a.pv[0]>0){var k=c(m);if(k){H[j].width=k.getAttribute("width")?k.getAttribute("width"):"0";H[j].height=k.getAttribute("height")?k.getAttribute("height"):"0";if(O(H[j].swfVersion)){if(a.webkit&&a.webkit<312){U(k)}X(m,true)}else{if(H[j].expressInstall&&!C&&O("6.0.65")&&(a.win||a.mac)){D(H[j])}else{d(k)}}}}else{X(m,true)}}}function U(m){var k=m.getElementsByTagName(P)[0];if(k){var p=Y("embed"),r=k.attributes;if(r){var o=r.length;for(var n=0;n<o;n++){if(r[n].nodeName.toLowerCase()=="data"){p.setAttribute("src",r[n].nodeValue)}else{p.setAttribute(r[n].nodeName,r[n].nodeValue)}}}var q=k.childNodes;if(q){var s=q.length;for(var l=0;l<s;l++){if(q[l].nodeType==1&&q[l].nodeName.toLowerCase()=="param"){p.setAttribute(q[l].getAttribute("name"),q[l].getAttribute("value"))}}}m.parentNode.replaceChild(p,m)}}function F(i){if(a.ie&&a.win&&O("8.0.0")){G.attachEvent("onunload",function(){var k=c(i);if(k){for(var j in k){if(typeof k[j]=="function"){k[j]=function(){}}}k.parentNode.removeChild(k)}})}}function D(j){C=true;var o=c(j.id);if(o){if(j.altContentId){var l=c(j.altContentId);if(l){L=l;T=j.altContentId}}else{L=b(o)}if(!(/%$/.test(j.width))&&parseInt(j.width,10)<310){j.width="310"}if(!(/%$/.test(j.height))&&parseInt(j.height,10)<137){j.height="137"}g.title=g.title.slice(0,47)+" - Flash Player Installation";var n=a.ie&&a.win?"ActiveX":"PlugIn",k=g.title,m="MMredirectURL="+G.location+"&MMplayerType="+n+"&MMdoctitle="+k,p=j.id;if(a.ie&&a.win&&o.readyState!=4){var i=Y("div");p+="SWFObjectNew";i.setAttribute("id",p);o.parentNode.insertBefore(i,o);o.style.display="none";G.attachEvent("onload",function(){o.parentNode.removeChild(o)})}R({data:j.expressInstall,id:K,width:j.width,height:j.height},{flashvars:m},p)}}function d(j){if(a.ie&&a.win&&j.readyState!=4){var i=Y("div");j.parentNode.insertBefore(i,j);i.parentNode.replaceChild(b(j),i);j.style.display="none";G.attachEvent("onload",function(){j.parentNode.removeChild(j)})}else{j.parentNode.replaceChild(b(j),j)}}function b(n){var m=Y("div");if(a.win&&a.ie){m.innerHTML=n.innerHTML}else{var k=n.getElementsByTagName(P)[0];if(k){var o=k.childNodes;if(o){var j=o.length;for(var l=0;l<j;l++){if(!(o[l].nodeType==1&&o[l].nodeName.toLowerCase()=="param")&&!(o[l].nodeType==8)){m.appendChild(o[l].cloneNode(true))}}}}}return m}function R(AE,AC,q){var p,t=c(q);if(typeof AE.id==Z){AE.id=q}if(a.ie&&a.win){var AD="";for(var z in AE){if(AE[z]!=Object.prototype[z]){if(z=="data"){AC.movie=AE[z]}else{if(z.toLowerCase()=="styleclass"){AD+=' class="'+AE[z]+'"'}else{if(z!="classid"){AD+=" "+z+'="'+AE[z]+'"'}}}}}var AB="";for(var y in AC){if(AC[y]!=Object.prototype[y]){AB+='<param name="'+y+'" value="'+AC[y]+'" />'}}t.outerHTML='<object classid="clsid:D27CDB6E-AE6D-11cf-96B8-444553540000"'+AD+">"+AB+"</object>";F(AE.id);p=c(AE.id)}else{if(a.webkit&&a.webkit<312){var AA=Y("embed");AA.setAttribute("type",W);for(var x in AE){if(AE[x]!=Object.prototype[x]){if(x=="data"){AA.setAttribute("src",AE[x])}else{if(x.toLowerCase()=="styleclass"){AA.setAttribute("class",AE[x])}else{if(x!="classid"){AA.setAttribute(x,AE[x])}}}}}for(var w in AC){if(AC[w]!=Object.prototype[w]){if(w!="movie"){AA.setAttribute(w,AC[w])}}}t.parentNode.replaceChild(AA,t);p=AA}else{var s=Y(P);s.setAttribute("type",W);for(var v in AE){if(AE[v]!=Object.prototype[v]){if(v.toLowerCase()=="styleclass"){s.setAttribute("class",AE[v])}else{if(v!="classid"){s.setAttribute(v,AE[v])}}}}for(var u in AC){if(AC[u]!=Object.prototype[u]&&u!="movie"){E(s,u,AC[u])}}t.parentNode.replaceChild(s,t);p=s}}return p}function E(k,i,j){var l=Y("param");l.setAttribute("name",i);l.setAttribute("value",j);k.appendChild(l)}function c(i){return g.getElementById(i)}function Y(i){return g.createElement(i)}function O(k){var j=a.pv,i=k.split(".");i[0]=parseInt(i[0],10);i[1]=parseInt(i[1],10);i[2]=parseInt(i[2],10);return(j[0]>i[0]||(j[0]==i[0]&&j[1]>i[1])||(j[0]==i[0]&&j[1]==i[1]&&j[2]>=i[2]))?true:false}function A(m,j){if(a.ie&&a.mac){return }var l=g.getElementsByTagName("head")[0],k=Y("style");k.setAttribute("type","text/css");k.setAttribute("media","screen");if(!(a.ie&&a.win)&&typeof g.createTextNode!=Z){k.appendChild(g.createTextNode(m+" {"+j+"}"))}l.appendChild(k);if(a.ie&&a.win&&typeof g.styleSheets!=Z&&g.styleSheets.length>0){var i=g.styleSheets[g.styleSheets.length-1];if(typeof i.addRule==P){i.addRule(m,j)}}}function X(k,i){var j=i?"visible":"hidden";if(S){c(k).style.visibility=j}else{A("#"+k,"visibility:"+j)}}return{registerObject:function(l,i,k){if(!a.w3cdom||!l||!i){return }var j={};j.id=l;j.swfVersion=i;j.expressInstall=k?k:false;H[H.length]=j;X(l,false)},getObjectById:function(l){var i=null;if(a.w3cdom&&S){var j=c(l);if(j){var k=j.getElementsByTagName(P)[0];if(!k||(k&&typeof j.SetVariable!=Z)){i=j}else{if(typeof k.SetVariable!=Z){i=k}}}}return i},embedSWF:function(n,u,r,t,j,m,k,p,s){if(!a.w3cdom||!n||!u||!r||!t||!j){return }r+="";t+="";if(O(j)){X(u,false);var q=(typeof s==P)?s:{};q.data=n;q.width=r;q.height=t;var o=(typeof p==P)?p:{};if(typeof k==P){for(var l in k){if(k[l]!=Object.prototype[l]){if(typeof o.flashvars!=Z){o.flashvars+="&"+l+"="+k[l]}else{o.flashvars=l+"="+k[l]}}}}J(function(){R(q,o,u);if(q.id==u){X(u,true)}})}else{if(m&&!C&&O("6.0.65")&&(a.win||a.mac)){X(u,false);J(function(){var i={};i.id=i.altContentId=u;i.width=r;i.height=t;i.expressInstall=m;D(i)})}}},getFlashPlayerVersion:function(){return{major:a.pv[0],minor:a.pv[1],release:a.pv[2]}},hasFlashPlayerVersion:O,createSWF:function(k,j,i){if(a.w3cdom&&S){return R(k,j,i)}else{return undefined}},createCSS:function(j,i){if(a.w3cdom){A(j,i)}},addDomLoadEvent:J,addLoadEvent:M,getQueryParamValue:function(m){var l=g.location.search||g.location.hash;if(m==null){return l}if(l){var k=l.substring(1).split("&");for(var j=0;j<k.length;j++){if(k[j].substring(0,k[j].indexOf("="))==m){return k[j].substring((k[j].indexOf("=")+1))}}}return""},expressInstallCallback:function(){if(C&&L){var i=c(K);if(i){i.parentNode.replaceChild(L,i);if(T){X(T,true);if(a.ie&&a.win){L.style.display="block"}}L=null;T=null;C=false}}}}}();