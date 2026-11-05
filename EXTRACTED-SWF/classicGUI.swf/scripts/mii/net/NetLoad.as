package mii.net
{
   import flash.events.DataEvent;
   import flash.events.ErrorEvent;
   import flash.events.Event;
   import flash.events.EventDispatcher;
   import flash.events.IOErrorEvent;
   import flash.events.SecurityErrorEvent;
   import flash.net.FileFilter;
   import flash.net.FileReference;
   import flash.net.URLLoader;
   import flash.net.URLLoaderDataFormat;
   import flash.net.URLRequest;
   import flash.net.URLRequestMethod;
   import mii.fileio.ILoad;
   
   public class NetLoad extends EventDispatcher implements ILoad
   {
      
      private var _data:*;
      
      public var urlRequest:URLRequest;
      
      public var urlLoader:URLLoader = new URLLoader();
      
      public var uploadScript:String = "scripts/uploadfile.php";
      
      public var uploadFileFilter:String = "*.mii;*.xml";
      
      public var fileRef:FileReference = new FileReference();
      
      public var lastURL:String = "none";
      
      public function NetLoad(param1:String = "")
      {
         super();
         if(param1)
         {
            uploadScript = param1;
         }
         urlRequest = new URLRequest(uploadScript);
         urlRequest.method = URLRequestMethod.POST;
         fileRef.addEventListener("uploadCompleteData",uploadCompleteData);
         fileRef.addEventListener(Event.COMPLETE,uploadCompleteData);
         fileRef.addEventListener(Event.SELECT,select);
         fileRef.addEventListener(IOErrorEvent.IO_ERROR,uploadError);
         fileRef.addEventListener(SecurityErrorEvent.SECURITY_ERROR,uploadError);
         urlLoader.addEventListener(Event.COMPLETE,netLoaded);
         urlLoader.addEventListener(IOErrorEvent.IO_ERROR,loadError);
         urlLoader.addEventListener(SecurityErrorEvent.SECURITY_ERROR,loadError);
      }
      
      public function loadURI(param1:String) : void
      {
      }
      
      public function upload(param1:String, param2:Boolean = false) : void
      {
         var url:String = param1;
         var useCurrentFormat:Boolean = param2;
         lastURL = url;
         if(!useCurrentFormat)
         {
            setFormat(url);
         }
         try
         {
            urlLoader.close();
         }
         catch(e:Error)
         {
         }
         try
         {
            urlLoader.load(new URLRequest(url));
         }
         catch(e:Error)
         {
         }
      }
      
      private function uploadError(param1:Event) : void
      {
         dispatchEvent(new ErrorEvent(ErrorEvent.ERROR,false,false,param1.type));
      }
      
      private function loadError(param1:Event) : void
      {
         dispatchEvent(param1);
      }
      
      private function setFormat(param1:String) : void
      {
         var _loc2_:String = null;
         _loc2_ = param1.slice(-3);
         urlLoader.dataFormat = _loc2_ == "mii" ? URLLoaderDataFormat.BINARY : URLLoaderDataFormat.TEXT;
      }
      
      private function netLoaded(param1:Event) : void
      {
         _data = urlLoader.dataFormat == URLLoaderDataFormat.BINARY ? urlLoader.data : new XML(urlLoader.data);
         dispatchEvent(param1);
      }
      
      public function load() : void
      {
         fileRef.browse([new FileFilter("Mii Data (" + uploadFileFilter + ")",uploadFileFilter)]);
      }
      
      private function uploadCompleteData(param1:Event) : void
      {
         if(param1 is DataEvent)
         {
            upload(DataEvent(param1).data,true);
         }
      }
      
      public function get data() : *
      {
         return _data;
      }
      
      private function select(param1:Event) : void
      {
         _data = null;
         setFormat(fileRef.name);
         fileRef.upload(urlRequest);
      }
   }
}

