package mii.net
{
   import flash.events.Event;
   import flash.events.EventDispatcher;
   import flash.events.IOErrorEvent;
   import flash.events.SecurityErrorEvent;
   import flash.net.URLLoader;
   import flash.net.URLRequest;
   
   public class ValidateConnectivity extends EventDispatcher
   {
      
      public var connected:Boolean = false;
      
      public var script:String;
      
      private var loader:URLLoader = new URLLoader();
      
      public var message:String;
      
      public function ValidateConnectivity(param1:String = "scripts/connected.php", param2:String = "true")
      {
         super();
         this.script = param1;
         this.message = param2;
         loader.addEventListener(Event.COMPLETE,urlLoaded);
         loader.addEventListener(IOErrorEvent.IO_ERROR,urlLoaded);
         loader.addEventListener(SecurityErrorEvent.SECURITY_ERROR,urlLoaded);
      }
      
      private function urlLoaded(param1:Event) : void
      {
         connected = Boolean(loader.data == message);
         dispatchEvent(new Event(Event.COMPLETE));
      }
      
      public function test() : void
      {
         try
         {
            loader.load(new URLRequest(script));
         }
         catch(err:Error)
         {
            urlLoaded(new Event(err.name));
         }
      }
   }
}

