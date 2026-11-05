package mii.fileio
{
   import flash.system.Capabilities;
   import mii.air.FileInvoke;
   
   public class FileOpener
   {
      
      public function FileOpener()
      {
         super();
      }
      
      public static function create(param1:Function) : IInvoke
      {
         var _loc2_:IInvoke = null;
         switch(Capabilities.playerType)
         {
            case "Desktop":
               _loc2_ = new FileInvoke(param1);
         }
         return _loc2_;
      }
   }
}

