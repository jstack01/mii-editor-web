package mii.values
{
   public class MiiDataValue extends Range
   {
      
      private var shift:int;
      
      private var blocks:Array;
      
      private var index:int;
      
      private var prefShift:int;
      
      private var length:int;
      
      private var suffMask:int;
      
      private var _value:int;
      
      public function MiiDataValue(param1:Array, param2:int = 0, param3:int = 0, param4:int = 16, param5:int = 0, param6:int = 0)
      {
         this.blocks = param1;
         this.index = param2;
         this.shift = param3;
         this.length = param4;
         prefShift = param3 + param4;
         suffMask = int(Math.pow(2,param3) - 1);
         _value = int(param1[param2]) >>> param3 & int(Math.pow(2,param4) - 1);
         if(param6 == 0)
         {
            param6 = Math.pow(2,param4) - 1;
         }
         super(param5,param6);
         normalize();
      }
      
      public function set value(param1:int) : void
      {
         var _loc2_:int = 0;
         _value = clamp(param1);
         _loc2_ = int(blocks[index]);
         blocks[index] = shift ? (_loc2_ >>> prefShift << prefShift) + (_value << shift) + (_loc2_ & suffMask) : (blocks[index] = (_loc2_ >>> length << length) + _value);
      }
      
      public function toString() : String
      {
         var _loc1_:String = null;
         _loc1_ = value.toString(2);
         while(_loc1_.length < length)
         {
            _loc1_ = "0" + _loc1_;
         }
         return _loc1_;
      }
      
      public function get value() : int
      {
         return _value;
      }
      
      public function getValuePercent() : Number
      {
         return (value - min) / span;
      }
      
      public function randomize() : void
      {
         value = valueAt(Math.random(),true);
      }
   }
}

