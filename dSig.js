/**
* dSig developed by Damion Mullins
*/
(function($) {
    /*
    * Initialize
    */
    $.fn.dSig = function(settingsObj) {
        var textarea        = $(this);       
        var textareaId      = textarea.prop('id');        
        var signing         = false;
        var eventPos        = { 
            x: 0, 
            y: 0 
        };
        var lastEventPos    = eventPos;
        var boxAttributes   = $.fn.getSignatureBoxAttributes(settingsObj);
        var signatureBoxObj = $.fn.setup(textarea, boxAttributes);
        
        if (0 === boxAttributes.readonly) {
            $("#_dSig_" + textareaId + "_controls_buttons_clear").on('click', function(event) {
                $.fn.clearSignatureBox(signatureBoxObj, settingsObj, textarea);
                event.preventDefault();
            });
            
            $("#_dSig_" + textareaId + "_controls_buttons_upload").on('change', function(event) {
                $.fn.uploadFile(boxAttributes, signatureBoxObj, event);
            });
            
            signatureBoxObj.box.addEventListener("mousedown", function (event) {
                signing      = true;
                lastEventPos = $.fn.getMousePosition(signatureBoxObj.box, event);
            }, false);
            
            signatureBoxObj.box.addEventListener("mouseup", function (event) {
                signing = false;
                $.fn.populateTextarea(signatureBoxObj, textarea);
            }, false);
            
            signatureBoxObj.box.addEventListener("mousemove", function (event) {
                if (true === signing) {
                    eventPos = $.fn.getMousePosition(signatureBoxObj.box, event);
                    $.fn.sign(signatureBoxObj, eventPos, lastEventPos, boxAttributes);
                    lastEventPos = eventPos;
                }            
            }, false);
            
            signatureBoxObj.box.addEventListener("touchstart", function (event) {
              eventPos       = $.fn.getTouchPosition(signatureBoxObj.box, event);
              var touch      = event.touches[0];
              var type       = "mousedown";
              var mouseEvent = $.fn.getTouchEvent(touch, type);
              signatureBoxObj.box.dispatchEvent(mouseEvent);
            }, false);
            
            signatureBoxObj.box.addEventListener("touchend", function (event) {
              var mouseEvent = new MouseEvent("mouseup", {});
              signatureBoxObj.box.dispatchEvent(mouseEvent);
            }, false);
            
            signatureBoxObj.box.addEventListener("touchmove", function (event) {
              var touch      = event.touches[0];
              var type       = "mousemove";
              var mouseEvent = $.fn.getTouchEvent(touch, type);
              signatureBoxObj.box.dispatchEvent(mouseEvent);
            }, false);
        }
        
    };
    
    /**
    * Mouse equivalent for touch
    * @param touch event object value
    * @param type string
    */
    $.fn.getTouchEvent = function(touch, type) {
        var mouseEvent = new MouseEvent(type, {
            clientX: touch.clientX,
            clientY: touch.clientY
        });
          
        return mouseEvent;
    };
    
    /**
    * Get touch position
    * @param signatureBox object
    * @param event DOM object
    */
    $.fn.getTouchPosition = function(signatureBox, event) {
        var rect = signatureBox.getBoundingClientRect();
        return {
          x: event.touches[0].clientX - rect.left,
          y: event.touches[0].clientY - rect.top
        };
    };
    
    /**
    * Get touch position
    * @param boxAttributes object
    * @param signatureBox object
    * @param event DOM object
    */
    $.fn.uploadFile = function(boxAttributes, signatureBoxObj, event) {
        if (1 === boxAttributes.allowUpload) {
            var fread    = new FileReader();
            fread.onload = function(event) {
                var image    = new Image();
                image.onload = function() {
                    signatureBoxObj.box.width = image.width;
                    signatureBoxObj.box.height = image.height;
                    signatureBoxObj.ctx.drawImage(image, 0, 0);
                }
                image.src = event.target.result;
            }
            fread.readAsDataURL(event.target.files[0]); 
        }
    };
    
    /**
    * Initiate clear event
    * @param signatureBox object
    * @param settingsObj object
    * @param textarea DOM object
    */
    $.fn.clearSignatureBox = function(signatureBoxObj, settingsObj, textarea) {
        var textareaId = textarea.prop('id');
        textarea.val('');
        signatureBoxObj.box.parentNode.removeChild(signatureBoxObj.box);
        $("#_dSig_" + textareaId + "_canvas_container").remove();
        textarea.dSig(settingsObj);
    };
    
    /**
    * Initiate writing signature
    * @param signatureBox object
    * @param eventPos object
    * @param lastEventPos object
    * @param boxAttributes object
    */
    $.fn.sign = function(signatureBoxObj, eventPos, lastEventPos, boxAttributes) {
        signatureBoxObj.ctx.strokeStyle           = boxAttributes.color;
        signatureBoxObj.ctx.imageSmoothingEnabled = true;
        signatureBoxObj.ctx.lineCap               = "round";
        signatureBoxObj.ctx.lineJoin              = 'round';
        signatureBoxObj.ctx.lineWidth             = boxAttributes.line;
        signatureBoxObj.ctx.moveTo(lastEventPos.x, lastEventPos.y);
        signatureBoxObj.ctx.lineTo(eventPos.x, eventPos.y);
        signatureBoxObj.ctx.stroke();
    };
    
    /**
    * Populate textarea with signature data
    * @param signatureBox object
    * @param textarea DOM object
    */
    $.fn.populateTextarea = function(signatureBoxObj, textarea) {
        textarea.val('');
        textarea.val(signatureBoxObj.box.toDataURL());
    };
    
    /**
    * Get the mouse position
    * @param signatureBox object
    * @param event DOM object
    */
    $.fn.getMousePosition = function(signatureBox, event) {
        var rect = signatureBox.getBoundingClientRect();
        return {
            x: event.clientX - rect.left,
            y: event.clientY - rect.top
        };
    };
    
    /**
    * Setup signature box
    * @param textarea DOM object
    * @param boxAttributes object
    */
    $.fn.setup = function(textarea, boxAttributes) {
        var textareaId = textarea.prop('id');
        var obj        = {};
        
        $.fn.hideSelect(textarea);
        $.fn.showDsig(textarea, boxAttributes);
        obj.box = document.getElementById("_dSig_" + textareaId + "_canvas");
        obj.ctx = obj.box.getContext("2d");
        $.fn.populateSignature(textarea, obj);
        
        return obj;
    }
    
    /**
    * Populate signature in dSig
    * @param textarea DOM object
    * @param obj object
    */
    $.fn.populateSignature  = function(textarea, obj) {
        if ("" !== textarea.val()) {
            var img = new window.Image();
            img.addEventListener("load", function () {
                obj.box.getContext("2d").drawImage(img, 0, 0);
            });
            img.setAttribute("src", textarea.val());
        }
    };
    
    /**
    * Hide textarea
    * @param textarea DOM object
    */
    $.fn.hideSelect = function(textarea) {
        textarea.addClass('_dSig_hide_textarea');
    };
    
    /**
    * Render dSig box
    * @param textarea DOM object
    */
    $.fn.showDsig = function(textarea, boxAttributes) {
        textarea.after(function() {
            return $.fn.buildDsig(textarea, boxAttributes);
        });
        var textareaId = textarea.prop('id');
        $("#_dSig_" + textareaId + "_controls_container, #_dSig_" + textareaId + "_text_container").css({"width":boxAttributes.width});
    };
    
    /**
    * Setup variables
    */
    $.fn.varSetup = function(boxAttributes) {
        var obj = {
            "boxAttributes": boxAttributes,
            "border": "_dSig_canvas_container_border",
            "areInitials": "",
            "allowUploads": "",
            "disallowUploadClass": ""
        };
        obj = $.fn.initialsSetup(obj);
        obj = $.fn.borderSetup(obj);
        obj = $.fn.allowUploadSetup(obj);
        
        return obj;
    };
    
    /**
    * Vars for initials
    */
    $.fn.initialsSetup = function(obj) {
        if (1 === obj.boxAttributes.initials) {
            obj.boxAttributes.width  = "100px";
            obj.boxAttributes.height = "100px";
            obj.border               = "";
            obj.areInitials          = "_initials";
        }
        
        return obj;
    };
    
    /**
    * Confirm border
    */
    $.fn.borderSetup = function(obj) {
        if (1 === obj.boxAttributes.hideBorder) {
            obj.border = "";
        }
        
        return obj;
    };
    
    /**
    * Configure upload option
    */
    $.fn.allowUploadSetup = function(obj) {
        if (0 === obj.boxAttributes.allowUpload) {
            obj.allowUploads        = "disabled";
            obj.disallowUploadClass = "_dSig_controls_buttons_upload_disabled";           
        }
        
        return obj;
    };
    
    /**
    * Build the signature box
    * @param textarea DOM object
    * @param boxAttributes object
    */
    $.fn.buildDsig = function(textarea, boxAttributes) {
        var textareaId          = textarea.prop('id');
        var configObj           = $.fn.varSetup(boxAttributes);
        boxAttributes           = configObj.boxAttributes;
        var border              = configObj.border;
        var areInitials         = configObj.areInitials;
        var allowUploads        = configObj.allowUploads;
        var disallowUploadClass = configObj.disallowUploadClass;
        var obj                 = {};
        
        obj.controls            = "id='_dSig_" + textareaId + "_controls_container' class='_dSig_controls_container" + areInitials + "'";
        obj.clear               = "id='_dSig_" + textareaId + "_controls_buttons_clear' class='_dSig_controls_buttons _dSig_controls_buttons_clear'";
        obj.uploadLabel         = "for='_dSig_" + textareaId + "_controls_buttons_upload' class='_dSig_controls_buttons _dSig_controls_buttons_upload_label " + disallowUploadClass + "' accept='image/*'";
        obj.uploadBtn           = "type='file' id='_dSig_" + textareaId + "_controls_buttons_upload' class='_dSig_controls_buttons_upload' name='_dSig_" + textareaId + "_controls_buttons_upload'";
        obj.container           = "id='_dSig_" + textareaId + "_canvas_container' class='_dSig_canvas_container" + areInitials  + " " + border + "'";
        obj.canvas              = "id='_dSig_" + textareaId + "_canvas' class='_dSig_canvas' width='" + boxAttributes.width + "' height='" + boxAttributes.height + "'";
        obj.text                = "id='_dSig_" + textareaId + "_text_container' class='_dSig_text_container" + areInitials + "'";      
        
        var controls           = $.fn.getControls(obj, allowUploads, boxAttributes);
        
        return "<div " + obj.container + ">" +
                   "<canvas " + obj.canvas + "></canvas>" +
                   "<div " + obj.text + ">"+ boxAttributes.text + "</div>" +
                   controls +
               "</div>";
    };
    
    /**
    * Manage controls
    */
    $.fn.getControls = function(obj, allowUploads, boxAttributes) {
         var controls    = "<div " + obj.controls + ">" +
                          "<span " + obj.clear + "><a href='#'>&#215;</a></span>" +
                          "<label " + obj.uploadLabel + ">&#128206</label>" +
                          "<input " + obj.uploadBtn + " " + allowUploads + "/>" + 
                          "</div>";
    
        if (1 === boxAttributes.readonly) {
            controls = '';
        }
        
        return controls;
    };
    
    /**
    * Configure dSig
    * @param settingsObj object
    */
    $.fn.getSignatureBoxAttributes = function(settingsObj) {
        var obj         = {};
        userSettingsObj = $.fn.checkUserSettings(settingsObj);
        obj.width       = (userSettingsObj.hasOwnProperty("width")) ? settingsObj.width : "595px";
        obj.height      = (userSettingsObj.hasOwnProperty("height")) ? settingsObj.height : "150px";
        obj.color       = (userSettingsObj.hasOwnProperty("color")) ? settingsObj.color : "#222222";
        obj.line        = (userSettingsObj.hasOwnProperty("line")) ? settingsObj.line : 1;
        obj.text        = (userSettingsObj.hasOwnProperty("text")) ? settingsObj.text : "I understand and acknowledge that the signature I have added above is the legal electronic representation of my signature.";
        obj.readonly    = (userSettingsObj.hasOwnProperty("readonly")) ? settingsObj.readonly : 0;
        obj.hideBorder  = (userSettingsObj.hasOwnProperty("hideBorder")) ? settingsObj.hideBorder : 0;
        obj.initials    = (userSettingsObj.hasOwnProperty("initials")) ? settingsObj.initials : 0;
        obj.allowUpload = (userSettingsObj.hasOwnProperty("allowUpload")) ? settingsObj.allowUpload : 1;
        
        return obj;
    };
    
    /**
    * Check if user added configurations
    * @param settingsObj object
    */
    $.fn.checkUserSettings = function(settingsObj) {
        var obj = {};
        if (typeof settingsObj !== "undefined") {
            obj = settingsObj;
        }
        
        return obj;
    }
    
}(jQuery));
 
