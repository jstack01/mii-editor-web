package mii.display
{
   import flash.display.BitmapData;
   import flash.display.DisplayObject;
   import flash.geom.Matrix;
   import flash.geom.Point;
   import flash.geom.Rectangle;
   
   public class BitmapUtils
   {
      
      public function BitmapUtils()
      {
         super();
      }
      
      public static function createCenteredBitmapData(param1:DisplayObject, param2:Number, param3:Number, param4:Number = 1, param5:Point = null, param6:Boolean = true, param7:uint = 0) : BitmapData
      {
         var _loc8_:BitmapData = null;
         _loc8_ = new BitmapData(param2,param3,param6,param7);
         drawCenteredIn(param1,_loc8_,param4,param5,false);
         return _loc8_;
      }
      
      public static function drawCenteredIn(param1:DisplayObject, param2:BitmapData, param3:Number = 1, param4:Point = null, param5:Boolean = true) : void
      {
         var _loc6_:Rectangle = null;
         if(param4 == null)
         {
            param4 = new Point(0,0);
         }
         if(param5)
         {
            param2.fillRect(param2.rect,0);
         }
         _loc6_ = param1.getBounds(param1);
         param2.draw(param1,new Matrix(param3,0,0,param3,param4.x + param2.width / 2 - param3 * (_loc6_.left + param1.width / 2),param4.y + param2.height / 2 - param3 * (_loc6_.top + param1.height / 2)));
      }
   }
}

