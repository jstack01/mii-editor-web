package mii.authoring
{
   import com.senocular.ui.*;
   import flash.display.Loader;
   import flash.display.MovieClip;
   import flash.display.SimpleButton;
   import flash.events.Event;
   import flash.events.IOErrorEvent;
   import flash.events.MouseEvent;
   import flash.events.SecurityErrorEvent;
   import flash.net.URLRequest;
   import flash.net.navigateToURL;
   import flash.system.ApplicationDomain;
   import flash.text.TextField;
   import flash.utils.getDefinitionByName;
   import mii.*;
   import mii.air.*;
   import mii.authoring.controls.*;
   import mii.authoring.dialogs.*;
   import mii.display.*;
   import mii.net.*;
   import mii.values.*;
   
   [SWF(width="640", height="500", backgroundColor="#ffffff", frameRate="24")]
   public dynamic class ClassicGUI extends AbstractGUIPage
   {
      
      public var charGraphics:MiiCharacterGraphics;
      
      public var screenFile:NavigationButton;
      
      public var haveGraphics:Boolean = false;
      
      public var versionText:TextField;
      
      public var graphicsContainer:MovieClip;
      
      public var defaults:MiiDefaults = new MiiDefaults();
      
      public var pageText:TextField;
      
      public var onlineValidate:ValidateConnectivity = new ValidateConnectivity();
      
      public var localStorage:LocalSharedStorage = new LocalSharedStorage();
      
      public var characterLoader:Loader = new Loader();
      
      public var page_next:MovieClip;
      
      public var version:String = "0.0.0.0";
      
      public var miiURLPrefix:String;
      
      public var URLText:TextField;
      
      public var character:MiiCharacterData = new MiiCharacterData();
      
      public var updateFPMessage:MovieClip;
      
      public var hexData:String = "000000640065006600610075006c00740042006f0079404080807f5fc242899800044240318028a2088c08401448b88d008a008a25040000000000000000000000000000000000000000";
      
      public var screens:MovieClip;
      
      public var charDomain:ApplicationDomain;
      
      public var characterAssetsURL:String = "assets.swf";
      
      public var pages:Array = [];
      
      public var haveDefaults:Boolean = false;
      
      public var page_prev:MovieClip;
      
      public var homepage:SimpleButton;
      
      public function ClassicGUI()
      {
         var _loc1_:Array = null;
         super();
         stop();
         updateFPMessage.visible = false;
         if(versionText)
         {
            version = versionText.text;
            removeChild(versionText);
         }
         _loc1_ = localStorage.getLocal();
         if(Boolean(_loc1_) && Boolean(_loc1_[0]))
         {
            hexData = _loc1_[0];
         }
         if(loaderInfo.parameters)
         {
            if(loaderInfo.parameters.mii)
            {
               hexData = loaderInfo.parameters.mii;
            }
         }
         character.setHexData(hexData);
         setMiiURLPrefix();
         pages[1] = this;
         pages[2] = new CharacteristicsGeneral(this);
         pages[3] = new CharacteristicsSize(this);
         pages[4] = new CharacteristicsHead(this);
         pages[5] = new CharacteristicsFacialFeatures(this);
         pages[6] = new CharacteristicsHair(this);
         pages[7] = new CharacteristicsEyebrow(this);
         pages[8] = new CharacteristicsEye(this);
         pages[9] = new CharacteristicsNose(this);
         pages[10] = new CharacteristicsMouth(this);
         pages[11] = new CharacteristicsGlasses(this);
         pages[12] = new CharacteristicsMustache(this);
         pages[13] = new CharacteristicsMole(this);
         pages[14] = new CharacteristicsBeard(this);
         stage.addEventListener(Event.RENDER,updatePage);
         stage.invalidate();
      }
      
      public function initGUI(param1:Event) : void
      {
         if(currentFrame == 1 && haveGraphics && haveDefaults)
         {
            setMiiURLPrefix();
            graphicsContainer.visible = true;
            characterLoader.x = -charGraphics.nativeWidth / 2;
            nextFrame();
            removeEventListener(Event.ENTER_FRAME,initGUI);
            screens.initGUI();
         }
      }
      
      public function nextPage(param1:MouseEvent) : void
      {
         if(currPage < pageCount - 1)
         {
            ++currPage;
            drawPage();
         }
      }
      
      override public function nextFrame() : void
      {
         navigateToNewPage();
         super.nextFrame();
      }
      
      public function selectItem(param1:MouseEvent) : void
      {
         var _loc2_:int = 0;
         _loc2_ = param1.currentTarget.num + itemCount * currPage;
         _loc2_ = charGraphics.frameToValue(currProp + "Type",_loc2_ + 1);
         character.setValue(currProp + "Type",_loc2_);
         charGraphics.drawCharacter();
         updateURLText();
         updateSelectedItem();
      }
      
      public function updatePageText() : void
      {
         if(pageText)
         {
            pageText.text = currPage + 1 + "/" + pageCount;
         }
      }
      
      public function assignOptionListeners(param1:Array) : void
      {
         var _loc2_:MovieClip = null;
         var _loc3_:* = undefined;
         for each(_loc3_ in param1)
         {
            _loc2_ = this["option_" + _loc3_ + "_1"];
            if(_loc2_)
            {
               _loc2_.options = [currProp + _loc3_,1];
               _loc2_.addEventListener("click",adjustOption);
            }
            _loc2_ = this["option_" + _loc3_ + "_0"];
            if(_loc2_)
            {
               _loc2_.options = [currProp + _loc3_,-1];
               _loc2_.addEventListener("click",adjustOption);
            }
         }
      }
      
      public function updateURLText() : void
      {
         var _loc1_:String = null;
         _loc1_ = character.getHexData();
         URLText.text = miiURLPrefix + _loc1_;
         localStorage.setLocal(_loc1_);
      }
      
      public function setupColors(param1:String) : void
      {
         var _loc2_:Array = null;
         var _loc3_:MovieClip = null;
         var _loc4_:* = 0;
         _loc2_ = MiiCharacterGraphics[param1 + "Colors"];
         _loc4_ = int(_loc2_.length);
         while(_loc4_--)
         {
            _loc3_ = this["color" + _loc4_];
            _loc3_.type = param1;
            _loc3_.well.transform.colorTransform = _loc2_[_loc4_];
            _loc3_.addEventListener(MouseEvent.CLICK,assignColor);
         }
         updateSelectedColor(_loc3_.type);
      }
      
      private function graphicsLoaded(param1:Event) : void
      {
         charDomain = characterLoader.contentLoaderInfo.applicationDomain;
         charGraphics = characterLoader.content as MiiCharacterGraphics;
         charGraphics.character = character;
         haveGraphics = true;
      }
      
      private function graphicsLoadError(param1:Event) : void
      {
         charGraphics = new MiiCharacterGraphics();
         haveGraphics = true;
      }
      
      public function setMiiURLPrefix() : void
      {
         if(loaderInfo.parameters.miibaseurl)
         {
            miiURLPrefix = loaderInfo.parameters.miibaseurl;
         }
         else
         {
            miiURLPrefix = loaderInfo.url;
            if(Boolean(miiURLPrefix) && miiURLPrefix.indexOf("http") === 0)
            {
               try
               {
                  miiURLPrefix = miiURLPrefix.slice(0,1 + miiURLPrefix.lastIndexOf("/"));
               }
               catch(err:Error)
               {
               }
            }
         }
         if(!miiURLPrefix || miiURLPrefix == loaderInfo.url)
         {
            miiURLPrefix = defaults.baseUrl;
         }
         miiURLPrefix += miiURLPrefix.indexOf("?") == -1 ? "?mii=" : "&mii=";
      }
      
      public function goToHomePage(param1:MouseEvent) : void
      {
         navigateToURL(new URLRequest("http://www.miieditor.com"));
      }
      
      private function earlyRender(param1:Event) : void
      {
         stage.invalidate();
         removeEventListener(Event.ADDED,earlyRender);
      }
      
      private function navigateToNewPage() : void
      {
         var page:AbstractGUIPage = null;
         try
         {
            page = AbstractGUIPage(pages[currentFrame]);
            page.deconstruct();
         }
         catch(err:Error)
         {
            trace(err);
         }
         stage.invalidate();
      }
      
      public function drawItems() : void
      {
         var IconSet:Object = null;
         var item:MovieClip = null;
         var icon:MovieClip = null;
         var i:int = 0;
         var iconFrame:int = 0;
         var value:int = 0;
         i = itemCount;
         value = character.getValue(currProp + "Type");
         try
         {
            IconSet = getDefinitionByName("Icons_" + currProp);
         }
         catch(e:Error)
         {
         }
         while(i--)
         {
            item = this["item" + i];
            iconFrame = 1 + item.num + itemCount * currPage;
            while(item.numChildren > 1)
            {
               item.removeChildAt(1);
            }
            if(IconSet)
            {
               icon = new IconSet();
               icon.gotoAndStop(iconFrame);
               item.addChildAt(icon,1);
            }
         }
         updateSelectedItem();
      }
      
      public function adjustOption(param1:MouseEvent) : void
      {
         var _loc2_:String = null;
         var _loc3_:int = 0;
         _loc2_ = param1.currentTarget.options[0];
         _loc3_ = int(param1.currentTarget.options[1]);
         character.setValue(_loc2_,character.getValue(_loc2_) + _loc3_);
         charGraphics.drawCharacter();
         updateURLText();
      }
      
      private function defaultsLoaded(param1:Event) : void
      {
         haveDefaults = true;
         onlineValidate.script = defaults.onlineValidationScript;
      }
      
      override public function prevFrame() : void
      {
         navigateToNewPage();
         super.prevFrame();
      }
      
      public function updatePage(param1:Event) : void
      {
         var page:AbstractGUIPage = null;
         var event:Event = param1;
         try
         {
            page = AbstractGUIPage(pages[currentFrame]);
            page.init();
            page.updateGUI();
         }
         catch(err:Error)
         {
            addEventListener(Event.ADDED,earlyRender);
         }
      }
      
      public function updateSelectedColor(param1:String) : void
      {
         var _loc2_:Array = null;
         var _loc3_:MovieClip = null;
         var _loc4_:* = 0;
         var _loc5_:int = 0;
         _loc2_ = MiiCharacterGraphics[param1 + "Colors"];
         _loc4_ = int(_loc2_.length);
         _loc5_ = character.getValue(param1 + "Color");
         while(_loc4_--)
         {
            _loc3_ = this["color" + _loc4_];
            if(_loc5_ == _loc4_)
            {
               if(_loc3_.getChildByName("hilite") == null)
               {
                  _loc3_.addChild(new ColorSelected()).name = "hilite";
               }
            }
            else if(_loc3_.getChildByName("hilite"))
            {
               _loc3_.removeChild(_loc3_.getChildByName("hilite"));
            }
         }
      }
      
      public function prevPage(param1:MouseEvent) : void
      {
         if(currPage > 0)
         {
            --currPage;
            drawPage();
         }
      }
      
      override public function gotoAndStop(param1:Object, param2:String = null) : void
      {
         navigateToNewPage();
         super.gotoAndStop(param1,param2);
      }
      
      override public function updateGUI() : void
      {
         var url:String = null;
         addEventListener(Event.ENTER_FRAME,initGUI);
         homepage.addEventListener(MouseEvent.CLICK,goToHomePage);
         defaults.addEventListener(Event.COMPLETE,defaultsLoaded);
         graphicsContainer.visible = false;
         graphicsContainer.addChild(characterLoader);
         characterLoader.contentLoaderInfo.addEventListener(Event.INIT,graphicsLoaded);
         characterLoader.contentLoaderInfo.addEventListener(IOErrorEvent.IO_ERROR,graphicsLoadError);
         characterLoader.contentLoaderInfo.addEventListener(SecurityErrorEvent.SECURITY_ERROR,graphicsLoadError);
         try
         {
            url = Boolean(loaderInfo.url) && loaderInfo.url.indexOf("http://") == 0 ? characterAssetsURL + "?" + version : characterAssetsURL;
            characterLoader.load(new URLRequest(url));
            defaults.load();
         }
         catch(error:Error)
         {
         }
      }
      
      public function updateSelectedItem() : void
      {
         var _loc1_:MovieClip = null;
         var _loc2_:* = 0;
         var _loc3_:int = 0;
         var _loc4_:int = 0;
         var _loc5_:Class = null;
         _loc2_ = itemCount;
         _loc4_ = character.getValue(currProp + "Type");
         while(_loc2_--)
         {
            _loc1_ = this["item" + _loc2_];
            _loc3_ = 1 + _loc1_.num + itemCount * currPage;
            if(_loc4_ == charGraphics.frameToValue(currProp + "Type",_loc3_))
            {
               if(_loc1_.getChildByName("hilite") == null)
               {
                  _loc5_ = currProp == "eye" || currProp == "eyebrow" ? ItemFaceSelected : ItemSelected;
                  _loc1_.addChildAt(new _loc5_(),1).name = "hilite";
               }
            }
            else if(_loc1_.getChildByName("hilite"))
            {
               _loc1_.removeChild(_loc1_.getChildByName("hilite"));
            }
         }
      }
      
      public function assignColor(param1:MouseEvent) : void
      {
         character.setValue(param1.currentTarget.type + "Color",int(param1.currentTarget.name.slice(5)));
         charGraphics.drawCharacter();
         updateURLText();
         updateSelectedColor(param1.currentTarget.type);
      }
      
      public function assignItemListeners() : void
      {
         var _loc1_:* = 0;
         var _loc2_:MovieClip = null;
         _loc1_ = itemCount;
         while(_loc1_--)
         {
            _loc2_ = this["item" + _loc1_];
            _loc2_.num = _loc1_;
            _loc2_.addEventListener("click",selectItem);
         }
      }
      
      public function assignPageListeners() : void
      {
         page_prev.addEventListener(MouseEvent.CLICK,prevPage);
         page_next.addEventListener(MouseEvent.CLICK,nextPage);
      }
      
      public function drawPage() : void
      {
         drawItems();
         updatePageText();
      }
   }
}

