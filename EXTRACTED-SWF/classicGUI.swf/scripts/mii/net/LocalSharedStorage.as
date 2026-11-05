package mii.net
{
   import flash.net.SharedObject;
   import mii.*;
   
   public class LocalSharedStorage
   {
      
      private var localSOID:String = "localMiis";
      
      public var miiArray:Array = new Array();
      
      public function LocalSharedStorage(param1:String = "")
      {
         super();
         if(param1)
         {
            localSOID = param1;
         }
      }
      
      public function getLocal() : Array
      {
         var localMiis:SharedObject = null;
         var miis:Array = null;
         try
         {
            localMiis = SharedObject.getLocal(localSOID);
            miis = localMiis.data.miiArray as Array;
            return miis;
         }
         catch(e:Error)
         {
            return null;
         }
      }
      
      public function setLocal(param1:*) : Boolean
      {
         var localMiis:SharedObject = null;
         var miis:* = param1;
         if(miis is Array == false)
         {
            miis = [miis];
         }
         try
         {
            miiArray = miis;
            localMiis = SharedObject.getLocal(localSOID);
            localMiis.data.miiArray = miiArray;
            localMiis.flush();
         }
         catch(e:Error)
         {
            return false;
         }
         return true;
      }
   }
}

