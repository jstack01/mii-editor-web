package mii.values
{
   public class Range
   {
      
      protected var _max:Number;
      
      public var span:Number;
      
      protected var _min:Number;
      
      public function Range(param1:Number = 0, param2:Number = 0)
      {
         super();
         _min = param1;
         _max = param2;
         updateSpan();
      }
      
      private function updateSpan() : void
      {
         span = _max - _min;
      }
      
      public function set min(param1:Number) : void
      {
         _min = param1;
         updateSpan();
      }
      
      public function set max(param1:Number) : void
      {
         _max = param1;
         updateSpan();
      }
      
      public function get max() : Number
      {
         return _max;
      }
      
      public function stepValue(param1:Number, param2:int) : Number
      {
         var _loc3_:Number = NaN;
         var _loc4_:Number = NaN;
         var _loc5_:Number = NaN;
         _loc3_ = clamp(param1);
         if(param1 != _loc3_)
         {
            return _loc3_;
         }
         if(param2 < 2)
         {
            param2 = 2;
         }
         _loc4_ = span / (param2 - 1);
         _loc5_ = Math.round((param1 - _min) / _loc4_);
         return _min + _loc5_ * _loc4_;
      }
      
      public function normalize() : void
      {
         var _loc1_:Number = NaN;
         if(_min > _max)
         {
            _loc1_ = _min;
            _min = _max;
            _max = _loc1_;
            updateSpan();
         }
      }
      
      public function get min() : Number
      {
         return _min;
      }
      
      public function percentAt(param1:Number) : Number
      {
         param1 = clamp(param1);
         return (param1 - _min) / span;
      }
      
      public function clamp(param1:Number) : Number
      {
         if(param1 < _min)
         {
            return _min;
         }
         if(param1 > _max)
         {
            return _max;
         }
         return param1;
      }
      
      public function valueAt(param1:Number, param2:Boolean = false) : Number
      {
         var _loc3_:Number = NaN;
         if(param2)
         {
            _loc3_ = clamp(_min + Math.floor((span + 1) * param1));
         }
         else
         {
            _loc3_ = clamp(_min + span * param1);
         }
         return _loc3_;
      }
   }
}

