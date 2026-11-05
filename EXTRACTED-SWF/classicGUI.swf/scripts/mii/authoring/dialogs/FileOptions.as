package mii.authoring.dialogs
{
   import flash.display.Bitmap;
   import flash.display.BitmapData;
   import flash.display.MovieClip;
   import flash.events.Event;
   import flash.events.FocusEvent;
   import flash.events.IOErrorEvent;
   import flash.events.KeyboardEvent;
   import flash.events.MouseEvent;
   import flash.events.SecurityErrorEvent;
   import flash.geom.ColorTransform;
   import flash.geom.Point;
   import flash.system.Capabilities;
   import flash.text.TextField;
   import flash.ui.Keyboard;
   import mii.*;
   import mii.authoring.*;
   import mii.authoring.controls.*;
   import mii.display.*;
   import mii.fileio.*;
   import mii.net.*;
   
   [Embed(source="/_assets/assets.swf", symbol="symbol352")]
   public class FileOptions extends MovieClip
   {
      
      public var exportBitmap:Bitmap;
      
      public var screenFile:NavigationButton;
      
      public var screenXML:NavigationButton;
      
      public var scrollBar:ScrollBar;
      
      private var repositionOffset:Point;
      
      public var bgColor:TextField;
      
      public var colorSlider:MovieClip;
      
      private var allowFileOperations:Boolean = true;
      
      private var showBody:Boolean = true;
      
      public var actionSaveXML:NavigationButton;
      
      public var miiSaver:ISave;
      
      public var arrowDown:MovieClip;
      
      private var actionSaveMiiInfo:String = "Save your current Mii character to your computer as a .mii binary file. If you ever want to reload your Mii into the editor, you can use the Load option to load this file to get your character back.";
      
      public var pngCheck:MovieClip;
      
      public var screenImage:NavigationButton;
      
      public var sizeOutput:TextField;
      
      private var exportAsJPEG:Boolean = true;
      
      public var actionLoadMii:NavigationButton;
      
      private var exportAsTransparent:Boolean = false;
      
      public var informationText:TextField;
      
      public var arrowUp:MovieClip;
      
      public var bodyCheck:MovieClip;
      
      public var baseSize:int = 300;
      
      public var versions:TextField;
      
      private var maxExportImageSize:* = 800;
      
      public var actionSaveMii:NavigationButton;
      
      public var zoomOutput:TextField;
      
      private var actionLoadMiiInfo:String = "Load Mii characters from your computer into the Mii Editor. Valid Mii files include .mii binary files or Mii\'s saved as XML.";
      
      public var actionImage:NavigationButton;
      
      public var miiLoader:ILoad;
      
      public var transparentCheck:MovieClip;
      
      private var exportPreviewOffset:Point = new Point(0,0);
      
      public var zoomScale:SizeSlider;
      
      public var screenOK:NavigationButton;
      
      private var zoomValue:Number = 25;
      
      private var screenXMLInfo:String = "View the XML for your current Mii character. You can edit the XML to have its changes affect your Mii or save the XML to your computer as an .xml file.";
      
      public var oversizeTimes:TextField;
      
      public var exportPreview:MovieClip;
      
      public var jpegCheck:MovieClip;
      
      public var target:ClassicGUI;
      
      public var previewHolder:MovieClip;
      
      private var screenImageInfo:String = "Export your Mii character to your computer as a bitmap image.  You can choose between JPEG or PNG formats.";
      
      public var updateGUI:Function;
      
      public var sizeScale:SizeSlider;
      
      private var fromFrame:int = 1;
      
      public var xmlText:TextField;
      
      public var previewCharGraphics:MiiCharacterGraphics;
      
      private var sizeValue:Number = 50;
      
      private var bgColorValue:String = "E3F3EF";
      
      private var minExportImageSize:* = 10;
      
      public function FileOptions()
      {
         super();
         stop();
         target = ClassicGUI(parent);
         miiSaver = FileSaver.create(target.defaults.downloadScript,target.defaults.downloadTarget);
         miiLoader = FileLoader.create(target,target.defaults.uploadScript);
         stage.addEventListener(Event.RENDER,updatePages);
         miiLoader.addEventListener(Event.COMPLETE,loadMiiComplete);
         miiLoader.addEventListener(Event.CANCEL,loadMiiComplete);
         miiLoader.addEventListener(IOErrorEvent.IO_ERROR,loadMiiComplete);
         miiLoader.addEventListener(SecurityErrorEvent.SECURITY_ERROR,loadMiiComplete);
      }
      
      public function exportImage(param1:MouseEvent) : void
      {
         var _loc2_:Number = NaN;
         var _loc3_:Number = NaN;
         var _loc4_:Number = NaN;
         var _loc5_:Point = null;
         var _loc6_:BitmapData = null;
         var _loc7_:Object = null;
         if(!allowFileOperations)
         {
            return;
         }
         _loc2_ = 0.15 + zoomValue / 100;
         _loc3_ = sizeValue / exportPreview.width;
         _loc4_ = _loc2_ * _loc3_;
         _loc5_ = new Point(exportPreviewOffset.x * _loc3_,exportPreviewOffset.y * _loc3_);
         if(!showBody)
         {
            target.charGraphics.body.visible = false;
         }
         _loc6_ = BitmapUtils.createCenteredBitmapData(target.charGraphics,sizeValue,sizeValue,_loc4_,_loc5_,Boolean(exportAsTransparent && !exportAsJPEG),parseInt(bgColorValue,16));
         if(!showBody)
         {
            target.charGraphics.body.visible = true;
         }
         _loc7_ = getGETObject();
         _loc7_.type = exportAsJPEG ? "jpg" : "png";
         miiSaver.save(_loc6_,_loc7_);
         _loc6_.dispose();
      }
      
      public function initGUI() : void
      {
         FileOpener.create(loadOpenedMii);
      }
      
      public function updateExportPage() : void
      {
         actionImage.addEventListener(MouseEvent.CLICK,exportImage);
         bgColor.addEventListener(Event.CHANGE,bgColorChange);
         bgColor.restrict = "a-fA-F0-9";
         bgColor.text = bgColorValue;
         bgColorChange(null);
         colorSlider.addEventListener(Event.CHANGE,bgSliderChange);
         colorSlider.value = parseInt(bgColorValue,16);
         addImagePreview();
         sizeScale.minValue = minExportImageSize;
         sizeScale.maxValue = maxExportImageSize;
         sizeScale.value = sizeValue;
         zoomScale.value = zoomValue;
         sizeScale.addEventListener(Event.CHANGE,sliderChanged);
         zoomScale.addEventListener(Event.CHANGE,sliderChanged);
         sliderChanged();
         exportPreview.addEventListener(MouseEvent.MOUSE_DOWN,startRepositioning);
         exportPreview.buttonMode = true;
         jpegCheck.mouseChildren = false;
         pngCheck.mouseChildren = false;
         transparentCheck.mouseChildren = false;
         jpegCheck.label.text = "JPEG";
         pngCheck.label.text = "PNG";
         transparentCheck.label.text = "Background";
         bodyCheck.label.text = "Body";
         jpegCheck.addEventListener(MouseEvent.CLICK,selectFileType);
         pngCheck.addEventListener(MouseEvent.CLICK,selectFileType);
         transparentCheck.addEventListener(MouseEvent.CLICK,selectTransparency);
         bodyCheck.addEventListener(MouseEvent.CLICK,toggleBody);
         if(exportAsJPEG)
         {
            selectExportCheck("JPEG");
         }
         else
         {
            selectExportCheck("PNG");
         }
         if(exportAsTransparent)
         {
            transparentCheck.gotoAndStop(1);
         }
         else
         {
            transparentCheck.gotoAndStop(2);
         }
         if(showBody)
         {
            bodyCheck.gotoAndStop(2);
         }
         else
         {
            bodyCheck.gotoAndStop(1);
         }
         sizeOutput.addEventListener(FocusEvent.FOCUS_OUT,imageTextChanged);
         zoomOutput.addEventListener(FocusEvent.FOCUS_OUT,imageTextChanged);
         sizeOutput.addEventListener(KeyboardEvent.KEY_DOWN,imageTextChanged);
         zoomOutput.addEventListener(KeyboardEvent.KEY_DOWN,imageTextChanged);
      }
      
      public function updateFilePage() : void
      {
         try
         {
            actionLoadMii.addEventListener(MouseEvent.CLICK,loadMiiFile);
            actionSaveMii.addEventListener(MouseEvent.CLICK,saveMiiFile);
            actionLoadMii.addEventListener(MouseEvent.ROLL_OVER,showInformation);
            actionSaveMii.addEventListener(MouseEvent.ROLL_OVER,showInformation);
            screenXML.addEventListener(MouseEvent.ROLL_OVER,showInformation);
            screenImage.addEventListener(MouseEvent.ROLL_OVER,showInformation);
            if(fromFrame == 1 && Capabilities.playerType != "Desktop")
            {
               target.onlineValidate.test();
               target.onlineValidate.addEventListener("complete",onlineValidated);
            }
            generateFrontPagePreview();
            updateVersions();
         }
         catch(err:Error)
         {
            addEventListener(Event.ADDED,earlyRender);
         }
      }
      
      private function updateColorFromText() : void
      {
         var _loc1_:ColorTransform = null;
         _loc1_ = exportPreview.background.transform.colorTransform;
         _loc1_.color = exportAsTransparent && !exportAsJPEG ? 16777215 : uint(parseInt(bgColor.text,16));
         exportPreview.background.transform.colorTransform = _loc1_;
         bgColorValue = bgColor.text;
      }
      
      public function updateXMLPage() : void
      {
         xmlText.text = target.character.toXMLString();
         screenFile.addEventListener(MouseEvent.CLICK,readXML);
         actionSaveXML.addEventListener(MouseEvent.CLICK,saveXML);
         scrollBar.target = xmlText;
      }
      
      private function whileRepositioning(param1:MouseEvent) : void
      {
         var _loc2_:Point = null;
         _loc2_ = new Point(mouseX,mouseY);
         exportPreviewOffset = exportPreviewOffset.add(_loc2_.subtract(repositionOffset));
         updateImagePreview();
         repositionOffset = _loc2_;
      }
      
      private function selectTransparency(param1:MouseEvent) : void
      {
         exportAsTransparent = !exportAsTransparent;
         if(exportAsTransparent)
         {
            transparentCheck.gotoAndStop(1);
         }
         else
         {
            transparentCheck.gotoAndStop(2);
         }
         updateColorFromText();
      }
      
      public function updatePages(param1:Event) : void
      {
         if(updateGUI is Function)
         {
            updateGUI();
            updateGUI = null;
         }
      }
      
      private function imageTextChanged(param1:Event) : void
      {
         var _loc2_:Number = NaN;
         var _loc3_:KeyboardEvent = null;
         if(param1 is KeyboardEvent)
         {
            _loc3_ = KeyboardEvent(param1);
            if(_loc3_.keyCode != Keyboard.ENTER)
            {
               return;
            }
         }
         _loc2_ = Number(sizeOutput.text);
         if(isNaN(_loc2_))
         {
            sizeOutput.text = String(sizeValue);
         }
         else
         {
            sizeScale.value = _loc2_;
            sizeValue = sizeScale.value;
            sizeOutput.text = String(Math.round(sizeScale.value));
         }
         _loc2_ = Number(zoomOutput.text);
         if(isNaN(_loc2_))
         {
            zoomOutput.text = String(zoomValue);
         }
         else
         {
            zoomScale.value = _loc2_;
            zoomValue = zoomScale.value;
            zoomOutput.text = String(Math.round(zoomScale.value));
         }
         updateImagePreview();
      }
      
      private function sliderChanged(param1:Event = null) : void
      {
         sizeValue = sizeScale.value;
         zoomValue = zoomScale.value;
         sizeOutput.text = String(Math.round(sizeScale.value));
         zoomOutput.text = String(Math.round(zoomScale.value));
         updateImagePreview();
      }
      
      public function readXML(param1:MouseEvent) : void
      {
         target.character.setXMLData(xmlText.text);
         target.charGraphics.drawCharacter();
      }
      
      private function updateVersions() : void
      {
         versions.text = "";
         versions.textColor = target.version == target.charGraphics.version ? 6710886 : 16711680;
         versions.text = "Editor: " + target.version + "\rCharacter: " + target.charGraphics.version;
      }
      
      private function clearInformation(param1:MouseEvent) : void
      {
         var currButton:* = undefined;
         var event:MouseEvent = param1;
         try
         {
            currButton = NavigationButton(event.currentTarget);
            currButton.removeEventListener(MouseEvent.ROLL_OUT,clearInformation);
            informationText.text = "";
         }
         catch(error:Error)
         {
         }
      }
      
      private function startRepositioning(param1:MouseEvent) : void
      {
         stage.addEventListener(MouseEvent.MOUSE_MOVE,whileRepositioning);
         stage.addEventListener(MouseEvent.MOUSE_UP,stopRepositioning);
         repositionOffset = new Point(mouseX,mouseY);
      }
      
      private function earlyRender(param1:Event) : void
      {
         stage.invalidate();
         removeEventListener(Event.ADDED,earlyRender);
      }
      
      private function bgSliderChange(param1:Event) : void
      {
         bgColor.text = colorSlider.hexValue;
         bgColorChange(null);
         updateColorFromText();
      }
      
      private function loadOpenedMii(param1:Array) : void
      {
         if(param1.length)
         {
            miiLoader.loadURI(param1[0]);
         }
      }
      
      private function toggleBody(param1:MouseEvent) : void
      {
         showBody = !showBody;
         if(showBody)
         {
            bodyCheck.gotoAndStop(2);
         }
         else
         {
            bodyCheck.gotoAndStop(1);
         }
         updateImagePreview();
      }
      
      private function stopRepositioning(param1:MouseEvent) : void
      {
         stage.removeEventListener(MouseEvent.MOUSE_MOVE,whileRepositioning);
         stage.removeEventListener(MouseEvent.MOUSE_UP,stopRepositioning);
      }
      
      public function saveMiiFile(param1:MouseEvent) : void
      {
         if(!allowFileOperations)
         {
            return;
         }
         miiSaver.save(target.character.getData(),getGETObject());
      }
      
      private function selectExportCheck(param1:String) : void
      {
         switch(param1)
         {
            case "PNG":
               pngCheck.gotoAndStop(2);
               jpegCheck.gotoAndStop(1);
               exportAsJPEG = false;
               transparentCheck.mouseEnabled = true;
               transparentCheck.transform.colorTransform = new ColorTransform();
               break;
            case "JPEG":
               pngCheck.gotoAndStop(1);
               jpegCheck.gotoAndStop(2);
               exportAsJPEG = true;
               transparentCheck.mouseEnabled = false;
               transparentCheck.transform.colorTransform = new ColorTransform(0.5,0.5,0.5);
         }
         updateColorFromText();
      }
      
      private function addImagePreview() : void
      {
         exportBitmap = new Bitmap(new BitmapData(exportPreview.width,exportPreview.height,true,0));
         exportBitmap.smoothing = true;
         exportPreview.addChild(exportBitmap);
         updateImagePreview();
      }
      
      private function updateImagePreview(param1:Event = null) : void
      {
         var _loc2_:Number = NaN;
         _loc2_ = 0.15 + zoomValue / 100;
         if(!showBody)
         {
            target.charGraphics.body.visible = false;
         }
         BitmapUtils.drawCenteredIn(target.charGraphics,exportBitmap.bitmapData,_loc2_,exportPreviewOffset);
         if(!showBody)
         {
            target.charGraphics.body.visible = true;
         }
         oversizeTimes.text = "x" + String(Math.round(100 * sizeValue / exportPreview.width) / 100);
      }
      
      public function saveXML(param1:MouseEvent) : void
      {
         if(!allowFileOperations)
         {
            return;
         }
         miiSaver.save(target.character.toXMLString(),getGETObject());
      }
      
      private function onlineValidated(param1:Event) : void
      {
         allowFileOperations = target.onlineValidate.connected;
         if(!allowFileOperations)
         {
            MovieClip(root).addChild(new Alert("The Mii Editor is not online. Load, Save and Export are disabled."));
         }
      }
      
      public function bgColorChange(param1:Event) : void
      {
         if(!bgColor.text)
         {
            return;
         }
         colorSlider.value = parseInt(bgColor.text,16);
         updateColorFromText();
      }
      
      private function getGETObject() : Object
      {
         return {
            "name":target.character.getValue("name"),
            "mii":target.character.getHexData()
         };
      }
      
      override public function gotoAndStop(param1:Object, param2:String = null) : void
      {
         fromFrame = currentFrame;
         super.gotoAndStop(param1,param2);
         switch(currentFrame)
         {
            case 2:
               updateGUI = updateFilePage;
               break;
            case 3:
               updateGUI = updateXMLPage;
               break;
            case 4:
               updateGUI = updateExportPage;
         }
         stage.invalidate();
      }
      
      public function loadMiiFile(param1:MouseEvent) : void
      {
         if(!allowFileOperations)
         {
            return;
         }
         miiLoader.load();
      }
      
      private function generateFrontPagePreview() : void
      {
         var _loc1_:Bitmap = null;
         if(!previewHolder)
         {
            return;
         }
         if(previewHolder.numChildren)
         {
            BitmapUtils.drawCenteredIn(target.charGraphics,Bitmap(previewHolder.getChildAt(0)).bitmapData,0.3);
         }
         else
         {
            _loc1_ = new Bitmap(BitmapUtils.createCenteredBitmapData(target.charGraphics,120,260,0.3));
            previewHolder.addChild(_loc1_);
         }
      }
      
      public function loadMiiComplete(param1:Event) : void
      {
         if(param1.type == Event.COMPLETE)
         {
            target.character.setData(miiLoader.data);
            target.charGraphics.drawCharacter();
            target.updatePage(null);
            if(currentFrame == 2 && Boolean(previewHolder.numChildren))
            {
               Bitmap(previewHolder.getChildAt(0)).bitmapData;
               generateFrontPagePreview();
            }
         }
      }
      
      private function showInformation(param1:MouseEvent) : void
      {
         var _loc2_:* = undefined;
         _loc2_ = NavigationButton(param1.currentTarget);
         _loc2_.addEventListener(MouseEvent.ROLL_OUT,clearInformation);
         informationText.text = String(this[_loc2_.name + "Info"]);
      }
      
      private function selectFileType(param1:MouseEvent) : void
      {
         switch(param1.target)
         {
            case jpegCheck:
               selectExportCheck("JPEG");
               break;
            case pngCheck:
               selectExportCheck("PNG");
         }
      }
   }
}

