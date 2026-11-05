package mii.air
{
   import com.adobe.images.JPGEncoder;
   import flash.display.BitmapData;
   import flash.events.ErrorEvent;
   import flash.events.Event;
   import flash.events.EventDispatcher;
   import flash.events.IOErrorEvent;
   import flash.events.SecurityErrorEvent;
   import flash.filesystem.File;
   import flash.filesystem.FileMode;
   import flash.filesystem.FileStream;
   import flash.utils.ByteArray;
   import mii.*;
   import mii.fileio.*;
   
   public class AirSave extends EventDispatcher implements ISave
   {
      
      public var dataFormat:String;
      
      private var _data:*;
      
      private var fileChooser:File = new File();
      
      public var compression:Number = 90;
      
      public function AirSave()
      {
         super();
         fileChooser.addEventListener(Event.SELECT,select);
         fileChooser.addEventListener(IOErrorEvent.IO_ERROR,selectError);
         fileChooser.addEventListener(SecurityErrorEvent.SECURITY_ERROR,selectError);
      }
      
      private function selectError(param1:Event) : void
      {
         dispatchEvent(param1);
      }
      
      public function get data() : *
      {
         return _data;
      }
      
      private function select(param1:Event) : void
      {
         var _loc2_:FileStream = null;
         _loc2_ = new FileStream();
         _loc2_.open(fileChooser,FileMode.WRITE);
         if(dataFormat == "text")
         {
            _loc2_.writeUTFBytes(String(_data));
         }
         else
         {
            _loc2_.writeBytes(ByteArray(_data));
         }
         _loc2_.close();
      }
      
      public function save(param1:*, param2:Object = null) : void
      {
         var _loc3_:JPGEncoder = null;
         if(param1 is ByteArray)
         {
            _data = param1;
            dataFormat = "binary";
         }
         else if(param1 is XML)
         {
            _data = param1.toXMLString();
            dataFormat = "text";
         }
         else if(param1 is String)
         {
            _data = param1;
            dataFormat = "text";
         }
         else
         {
            if(!(param1 is BitmapData))
            {
               _data = null;
               dataFormat = null;
               dispatchEvent(new ErrorEvent(ErrorEvent.ERROR,false,false,"NODATA"));
               return;
            }
            _loc3_ = new JPGEncoder(compression);
            _data = _loc3_.encode(BitmapData(param1));
            dataFormat = "binary";
         }
         fileChooser.browseForSave("Save");
      }
   }
}

