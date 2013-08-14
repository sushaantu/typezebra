require(
[
  'jQuery',
  'Cookie',
  'Slider',
  'Font',
  'SWFObject'
],


var number = document.getElementById('numbers'),
  nums = ''
var objects = '0123456789'.split('');
for(obj in objects) {
  nums += '<li>' + objects[obj] + '</li>';
}
var alphabet = document.getElementById('alphabet'),
  letters = '';
for(var i=65;i<=90;i++) {
  letters += '<li>' + String.fromCharCode(i) + '</li>';
}
var scharacters = document.getElementById('smalls'),
  schars = ''
for(var i=97;i<=122;i++) {
  schars += '<li>' + String.fromCharCode(i) + '</li>';
}

var fonts;
function loadFonts(fd) {
  fonts = fd.fonts();
  $("#status span").html("Loaded " + fonts.length + " fonts");
  for(var i = 0; i < fonts.length; i++) {
    var name = fonts[i].fontName;
    var nameNode = document.createElement("li");
    $(nameNode).addClass("font-name").attr('data-name', name).html(name);
    $("#list").append(nameNode);
    bindClick(nameNode);
  }
}

function bindClick(nameNode) {
  $(nameNode).click(function() {
    $('#list li').removeClass('active');
    $(this).addClass('active');
    _gaq.push(['_trackEvent', 'Local', 'click', $(this).attr('data-name')]);
    $('#alphabets, #smalls, #maintext, #numbers, #para1').css('font-family', '"' + $(this).attr('data-name') + '"');
  });
} 

function bindKeyPress() {
  $(document).unbind('keydown').keydown(function(e) {
    if(e.keyCode == 40 || e.keyCode == 38) {
      node = $('#list li.active');
      first = $('#list li:first');
      last = $('#list li:last');
      if(e.keyCode == 40) { //down key pressed
        node = !node.length ? first : (node.attr('data-name') == last.attr('data-name') ? first : node.next());
      }
      else if(e.keyCode == 38) {
        node = !node.length ? first : (node.attr('data-name') == first.attr('data-name') ? last : node.prev());
      }
        node.click();
    }
    });
}

$(document).ready(function() { // Check Flash version
  if (!swfobject.hasFlashPlayerVersion("9.0.0"))
    $("#status .toot").html("You don't have a compatible version of Flash installed. Please install latest version of Flash and refresh this page.");
  else {
    $("#status .toot").html("Loading your fonts...")
    var fontDetect = new FontDetect("font-detect-swf", "flash/FontList.swf", function(fd) {
      loadFonts(fd);
    });
  }
  $(document).click(function(e) {
  if($(e.target).parent().attr('id') == 'list') {
    bindKeyPress();
  }
  else {
    $(document).unbind('keydown');
  }
  });
});





  var url = 'https://www.googleapis.com/webfonts/v1/webfonts?key=AIzaSyAmlf-g5o1UbrluY5tL8regN11hP87F2zQ'

  $.get(url, function(data) {
    for(item in data.items) {
      item = data.items[item]
      $('#sidebar ul#list').append('<li class="google-font" onclick=\'loadFont("' + item.family + '", this)\'>' + item.family + '</li>')
    }
  }, "jsonp")

  function loadFont(fontFamily, element){
    $('#list li').removeClass('active');
    $(element).addClass('active');
    $('#lazyloading').attr('href', '//fonts.googleapis.com/css?family=' + fontFamily);
    $('#alphabets, #smalls, #maintext, #numbers, #para1').css('font-family', fontFamily);
     _gaq.push(['_trackEvent', 'Google', 'click', fontFamily]);
  }




$.getJSON('edge.json', function(data){
  var items = $();
  $.each(data, function(key, value){
    var edgeFontName = value.name;
    var li = $('<li class="edge-font">' + edgeFontName + '</li>');
    li.data('edgeFontSlug', value.slug);
    items = items.add(li);
  })
  $("#sidebar ul#list").empty().append(items)
    .on('click', 'li.edge-font', function() {
      $('#list li').removeClass('active');
      $(this).addClass('active');
      loadEdge( $(this).data('edgeFontSlug') );
      _gaq.push(['_trackEvent', 'Edge Fonts', 'click', $(this).text()]);
    });
});

function loadEdge(edgeFontSlug) {
  var url = 'http://use.edgefonts.net/' + edgeFontSlug + '.js';
  var script = document.createElement( 'script' );
  script.type = 'text/javascript';
  script.src = url;
  $('head').append( script );
  $('#alphabets, #smalls, #maintext, #numbers, #para1').css('font-family', edgeFontSlug);
}





var changeSize = function(){
  var text = $('#selectList').val();
  var textpx = $('#alphabets').css('font-size', text + 'px');
  var textpx = $('#maintext').css('font-size', text + 'px');
  var textpx = $('#smalls').css('font-size', text + 'px');
  var textpx = $('#numbers').css('font-size', text + 'px');
};
$('#selectList').on('change', function() { changeSize(); });

var changeMode = function(){
  var value = $('#selectMode').val();
  if (value == "usertext") {
    $('#maintext').show();
    $('.slider').show();
    $('.output').show();
    $('#alphabets').hide();
    $('#numbers').hide();
    $('#smalls').hide();
    $('#para1').hide();
  }
  else if(value == "abc") {
    $('#smalls').show();
    $('.slider').show();
    $('.output').show();
    $('#maintext').hide();
    $('#alphabets').hide();
    $('#numbers').hide();
    $('#para1').hide();
  }
  else if(value == "123") {
    $('#numbers').show();
    $('.slider').show();
    $('.output').show();
    $('#maintext').hide();
    $('#alphabets').hide();
    $('#smalls').hide();
    $('#para1').hide();
  }
  else if(value == "paragraph1") {
    $('#para1').show();
    $('#maintext').hide();
    $('#alphabets').hide();
    $('#smalls').hide();
    $('#numbers').hide();
    $('.slider').hide();
    $('.output').hide();
  }
  else {
    $('#alphabets').show();
    $('.slider').show();
    $('.output').show();
    $('#maintext').hide();
    $('#numbers').hide();
    $('#smalls').hide();
    $('#para1').hide();
  }
}

$('#selectMode').on('change', function() { changeMode(); });


$('span#clickinfo').click(function() { 
    $('.arrow_box').toggle();
    $(this).toggleClass('rotate');
});

if ( $.cookie('m') == '1' ) {
  $("#tell").hide();
}

$(".close").click(function () {
  $("#tell").hide();
  $.cookie('m', '1', { expires: 7, path: '/' });
});




$('ul#services li').click(function() {
  $("ul#services li.active").removeClass("active");
  $(this).addClass('active');
});

$('ul#services li#local').click(function() {
  $('#sidebar li.font-name').show();
  $('#sidebar li.google-font').hide();
  $('#sidebar li.edge-font').hide();
});

$('ul#services li#google').click(function() {
  $('#sidebar li.font-name').hide();
  $('#sidebar li.edge-font').hide();
  $('#sidebar li.google-font').show();
});

$('ul#services li#edge-web-fonts').click(function() {
  $('#sidebar li.edge-font').show();
  $('#sidebar li.google-font').hide();
  $('#sidebar li.font-name').hide();
});

$("[data-slider]")
  .each(function () {
    var input = $(this);
    $("<span>")
      .addClass("output")
      .insertAfter($(this));
  })
  .bind("slider:ready slider:changed", function (event, data) {
    $(this)
      .nextAll(".output:first")
        .html(data.value.toFixed(0));
  });









