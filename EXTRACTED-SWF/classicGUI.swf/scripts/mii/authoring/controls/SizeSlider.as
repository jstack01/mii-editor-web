package mii.authoring.controls
{
   import flash.display.MovieClip;
   import flash.events.Event;
   import flash.events.MouseEvent;
   
   [Embed(source="/_assets/assets.swf", symbol="symbol313")]
   public class SizeSlider extends MovieClip
   {
      
      public var minValue:Number = 0;
      
      public var maxValue:Number = 100;
      
      private var minSlide:Number = 0;
      
      private var _value:Number = 0;
      
      public var dragger:MovieClip;
      
      private var maxSlide:Number = 171;
      
      public function SizeSlider()
      {
         super();
         dragger.addEventListener(MouseEvent.MOUSE_DOWN,startDragging);
      }
      
      public function get value() : Number
      {
         return _value;
      }
      
      private function endDragging(param1:MouseEvent) : void
      {
         stage.removeEventListener(MouseEvent.MOUSE_MOVE,duringDragging);
         stage.removeEventListener(MouseEvent.MOUSE_UP,endDragging);
         dispatchEvent(new Event("endDrag"));
      }
      
      private function duringDragging(param1:MouseEvent) : void
      {
         var _loc2_:Number = NaN;
         _loc2_ = mouseY;
         if(_loc2_ < -maxSlide)
         {
            _loc2_ = -maxSlide;
         }
         else if(_loc2_ > minSlide)
         {
            _loc2_ = minSlide;
         }
         _value = minValue + (maxValue - minValue) * (-_loc2_ - minSlide) / (maxSlide - minSlide);
         dragger.y = _loc2_;
         dispatchEvent(new Event(Event.CHANGE));
      }
      
      private function startDragging(param1:MouseEvent) : void
      {
         stage.addEventListener(MouseEvent.MOUSE_MOVE,duringDragging);
         stage.addEventListener(MouseEvent.MOUSE_UP,endDragging);
         dispatchEvent(new Event("startDrag"));
      }
      
      public function set value(param1:Number) : void
      {
         if(param1 == _value)
         {
            return;
         }
         if(param1 < minValue)
         {
            _value = minValue;
         }
         else if(param1 > maxValue)
         {
            _value = maxValue;
         }
         else
         {
            _value = param1;
         }
         dragger.y = -(minSlide + (maxSlide - minSlide)) * (_value - minValue) / (maxValue - minValue);
      }
   }
}

