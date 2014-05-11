"use strict";

$(function() {
  var MyApp = window.MyApp = {};

  MyApp.app = new DevExpress.framework.html.HtmlApplication({
      namespace: MyApp,
      defaultLayout: "default"
  });

  MyApp.home = function () {
    var atoken = '', 
    cLat = '',
    cLong = '',

    viewModel = {
      message: ko.observable('Welcome To TourSnap!'),
      name: ko.observable(''),
      loadPanelVisible: ko.observable(false),
      selectedFile: null,

      postPhoto: function () {
        this.loadPanelVisible = true;
        var url='https://graph.facebook.com/me/photos?access_token=' + atoken;

        var formData = new FormData();
        formData.append("source", viewModel.selectedFile);
        formData.append("message", this.name());
        formData.append("location",{latitude: cLat, longitude: cLong});

        $.ajax({
          url: url,
          data: formData,
          cache: false,
          contentType: false,
          processData: false,
          type: 'POST',

          success: function(data){
            DevExpress.ui.notify('Your photo has been posted!', 'success', 3000);
          },
          error: function(){
            DevExpress.ui.notify('Unable to post!', 'error', 3000);            
          }
        });
      },

      getLocation: function () {
        navigator.geolocation.getCurrentPosition(this.locSuccess,this.locFailed);
      },

      locSuccess: function(params) {
        cLat = params.coords.latitude;
        cLong = params.coords.longitude;
      },

      locFailed: function(error){
            DevExpress.ui.notify('Cannot find you!', 'error', 3000);
      },

      signIn: function(){
        var AUTH_URL = "https://www.facebook.com/dialog/oauth";
        var APP_ID = "268527853296510";
        var req = {
          "authUrl" : AUTH_URL,
          "clientId" : APP_ID
        };

        oauth2.login(req, function(token) {
          atoken = token;
        }, function(error) {
            DevExpress.ui.notify('Unable to login!', 'error', 3000);
        });
      }
    };

    viewModel.getLocation();
    viewModel.signIn();


    return viewModel;            
  };

var setupPhotoChooserHandler = function(args) {
    var el = $("#snap");

    if(el.length !== 0) {
      el.on("change", function(event) {
        if(event.target.files.length === 1 && event.target.files[0].type.indexOf("image/") === 0) {
          var viewModel = args.viewInfo.model;
          viewModel.selectedFile = event.target.files[0];
          $("#myPic").attr("src", URL.createObjectURL(viewModel.selectedFile));
        }
      }); 
    }
  };


  MyApp.app.router.register(":view/:name", { view: "home", name: '' });
  MyApp.app.viewShown.add(setupPhotoChooserHandler);
  MyApp.app.navigate();   
});

