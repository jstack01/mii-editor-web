package mii.air
{
   import flash.display.DisplayObject;
   import flash.events.Event;
   import flash.events.EventDispatcher;
   import flash.events.IOErrorEvent;
   import flash.events.SecurityErrorEvent;
   import flash.filesystem.File;
   import flash.filesystem.FileMode;
   import flash.filesystem.FileStream;
   import flash.net.FileFilter;
   import flash.utils.ByteArray;
   import mii.fileio.ILoad;
   
   public class AirLoad extends EventDispatcher implements ILoad
   {
      
      private var dragDrop:FileDragDrop;
      
      public var dataFormat:String;
      
      private var _data:*;
      
      private var target:DisplayObject;
      
      private var fileChooser:File = new File();
      
      public var uploadFileFilter:String = "*.mii;*.xml";
      
      public function AirLoad(param1:DisplayObject)
      {
         super();
         this.target = param1;
         dragDrop = new FileDragDrop(param1,this);
         fileChooser.addEventListener(Event.SELECT,select);
         fileChooser.addEventListener(IOErrorEvent.IO_ERROR,selectError);
         fileChooser.addEventListener(SecurityErrorEvent.SECURITY_ERROR,selectError);
      }
      
      private function selectError(param1:Event) : void
      {
         dispatchEvent(param1);
      }
      
      public function loadURI(param1:String) : void
      {
         var uri:String = param1;
         try
         {
            openFile(new File(uri));
         }
         catch(error:Error)
         {
         }
      }
      
      public function openFile(param1:File) : void
      {
         var _loc2_:FileStream = null;
         setFormat(param1.name);
         _loc2_ = new FileStream();
         _loc2_.open(param1,FileMode.READ);
         _loc2_.position = 0;
         if(dataFormat == "text")
         {
            _data = _loc2_.readUTFBytes(_loc2_.bytesAvailable);
         }
         else
         {
            _data = new ByteArray();
            _loc2_.readBytes(_data);
         }
         _loc2_.close();
         dispatchEvent(new Event(Event.COMPLETE));
      }
      
      private function setFormat(param1:String) : void
      {
         var _loc2_:String = null;
         _loc2_ = param1.slice(-3);
         dataFormat = _loc2_ == "mii" ? "binary" : "text";
      }
      
      public function load() : void
      {
         fileChooser.browseForOpen("Open",[new FileFilter("Mii Data (" + uploadFileFilter + ")",uploadFileFilter)]);
      }
      
      public function get data() : *
      {
         return _data;
      }
      
      private function select(param1:Event) : void
      {
         openFile(fileChooser);
      }
   }
}

