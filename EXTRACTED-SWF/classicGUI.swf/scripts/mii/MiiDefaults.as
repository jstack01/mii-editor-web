package mii
{
   import flash.events.Event;
   import flash.events.EventDispatcher;
   import flash.events.IOErrorEvent;
   import flash.events.SecurityErrorEvent;
   import flash.net.URLLoader;
   import flash.net.URLRequest;
   
   public class MiiDefaults extends EventDispatcher
   {
      
      public static const DEFAULTS_REQUEST:URLRequest = new URLRequest("MiiEditor_defaults.xml");
      
      private var loader:URLLoader = new URLLoader();
      
      public var onlineValidationScript:String = "scripts/connected.php";
      
      public var baseUrl:String = "http://www.miieditor.com/";
      
      public var uploadScript:String = "scripts/uploadfile.php";
      
      public var downloadTarget:String = "_self";
      
      public var downloadScript:String = "scripts/downloadfile.php";
      
      public function MiiDefaults()
      {
         super();
         loader.addEventListener(Event.COMPLETE,xmlLoaded);
         loader.addEventListener(IOErrorEvent.IO_ERROR,xmlLoaded);
         loader.addEventListener(SecurityErrorEvent.SECURITY_ERROR,xmlLoaded);
      }
      
      private function xmlLoaded(param1:Event) : void
      {
         var defaults:XML = null;
         var event:Event = param1;
         if(event.type == Event.COMPLETE)
         {
            try
            {
               defaults = XML(loader.data);
               baseUrl = defaults.baseUrl.text()[0];
               onlineValidationScript = defaults.onlineValidationScript.text()[0];
               uploadScript = defaults.uploadScript.text()[0];
               downloadScript = defaults.downloadScript.text()[0];
               downloadTarget = defaults.downloadTarget.text()[0];
            }
            catch(err:Error)
            {
               trace("Error parsing defaults XML");
            }
         }
         dispatchEvent(new Event(Event.COMPLETE));
      }
      
      public function load(param1:URLRequest = null) : void
      {
         var request:URLRequest = param1;
         try
         {
            if(!request)
            {
               loader.load(DEFAULTS_REQUEST);
            }
            else
            {
               loader.load(request);
            }
         }
         catch(err:Error)
         {
            xmlLoaded(new Event(err.name));
         }
      }
   }
}

