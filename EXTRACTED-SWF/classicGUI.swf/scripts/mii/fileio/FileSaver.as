package mii.fileio
{
   import flash.system.Capabilities;
   import mii.air.AirSave;
   import mii.net.NetSave;
   
   public class FileSaver
   {
      
      public function FileSaver()
      {
         super();
      }
      
      public static function create(param1:String = "", param2:String = "_self") : ISave
      {
         var _loc3_:ISave = null;
         switch(Capabilities.playerType)
         {
            case "Desktop":
               _loc3_ = new AirSave();
               break;
            default:
               _loc3_ = new NetSave(param1,param2);
         }
         return _loc3_;
      }
   }
}

