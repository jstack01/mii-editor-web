package mii.net
{
   import com.adobe.images.JPGEncoder;
   import com.adobe.images.PNGEncoder;
   import flash.display.BitmapData;
   import flash.events.ErrorEvent;
   import flash.events.EventDispatcher;
   import flash.net.URLRequest;
   import flash.net.URLRequestMethod;
   import flash.net.navigateToURL;
   import flash.utils.ByteArray;
   import mii.*;
   import mii.fileio.*;
   
   public class NetSave extends EventDispatcher implements ISave
   {
      
      private var _data:*;
      
      private var request:URLRequest = new URLRequest();
      
      public var target:String;
      
      public var compression:Number = 90;
      
      public var saveURL:String = "scripts/downloadfile.php";
      
      public function NetSave(param1:String = "", param2:String = "_self")
      {
         super();
         if(param1)
         {
            saveURL = param1;
         }
         this.target = param2;
         request.method = URLRequestMethod.POST;
      }
      
      public function get data() : *
      {
         return _data;
      }
      
      public function save(param1:*, param2:Object = null) : void
      {
         var jpeg:JPGEncoder = null;
         var p:* = undefined;
         var data:* = param1;
         var additionalInfo:Object = param2;
         _data = data;
         if(data is ByteArray)
         {
            request.data = data;
            request.url = saveURL + "?type=mii";
         }
         else if(data is XML)
         {
            request.data = data.toXMLString();
            request.url = saveURL + "?type=xml";
         }
         else if(data is String)
         {
            request.data = data;
            request.url = saveURL + "?type=xml";
         }
         else
         {
            if(!(data is BitmapData))
            {
               dispatchEvent(new ErrorEvent(ErrorEvent.ERROR,false,false,"NODATA"));
               return;
            }
            if(Boolean(additionalInfo) && additionalInfo.type == "png")
            {
               request.data = PNGEncoder.encode(BitmapData(data));
               request.url = saveURL + "?type=png";
            }
            else
            {
               jpeg = new JPGEncoder(compression);
               request.data = jpeg.encode(BitmapData(data));
               request.url = saveURL + "?type=jpg";
            }
         }
         if(additionalInfo)
         {
            for(p in additionalInfo)
            {
               if(p != "type")
               {
                  request.url += "&" + p + "=" + additionalInfo[p];
               }
            }
         }
         try
         {
            navigateToURL(request,target);
         }
         catch(err:Error)
         {
            dispatchEvent(new ErrorEvent(ErrorEvent.ERROR,false,false,err.message));
         }
      }
   }
}

