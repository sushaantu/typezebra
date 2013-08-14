require.config({

  baseUrl: '/js',

  deps: ['main'],

  paths: {
    jQuery    : '//cdnjs.cloudflare.com/ajax/libs/jquery/1.8.3/jquery.min',
    Cookie    : 'plugins/jquery.cookie',
    Slider    : 'plugins/simple-slider',
    Font      : 'plugins/font-detect.js',
    SWFObject : 'plugins/swfobject.js',
  },

  shim: {
    jQuery: {
      exports: 'jQuery'
    },
    Cookie: {
      deps: ['jQuery'],
      exports: 'jQuery'
    },
    Slider: {
      deps: ['jQuery'],
      exports: 'jQuery'
    },
    Font: {
      deps: ['jQuery'],
      exports: 'jQuery'
    },
    SWFObject: {
      deps: ['jQuery'],
      exports: 'jQuery'
    }
  },

  waitSeconds: 20

})