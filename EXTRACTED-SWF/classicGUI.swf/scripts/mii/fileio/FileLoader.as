package mii.fileio
{
   import flash.display.DisplayObject;
   import flash.system.Capabilities;
   import mii.air.AirLoad;
   import mii.net.NetLoad;
   
   public class FileLoader
   {
      
      public function FileLoader()
      {
         super();
      }
      
      public static function create(param1:DisplayObject, param2:String = "") : ILoad
      {
         var _loc3_:ILoad = null;
         switch(Capabilities.playerType)
         {
            case "Desktop":
               _loc3_ = new AirLoad(param1);
               break;
            default:
               _loc3_ = new NetLoad(param2);
         }
         return _loc3_;
      }
   }
}

