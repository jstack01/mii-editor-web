package mii.authoring.controls
{
   import flash.display.MovieClip;
   import flash.events.Event;
   import flash.events.MouseEvent;
   
   [Embed(source="/_assets/assets.swf", symbol="symbol305")]
   public class ColorSlider extends MovieClip
   {
      
      private var maxSliderValue:* = 255;
      
      private var blueDraggerValue:Number = 0;
      
      public var greenDragger:MovieClip;
      
      public var minValue:Number = 0;
      
      private var greenDraggerValue:Number = 0;
      
      public var maxValue:Number = 16777215;
      
      private var minSliderValue:* = 0;
      
      private var minSlide:Number = -115.5;
      
      private var maxSlide:Number = 115.5;
      
      public var redDragger:MovieClip;
      
      public var blueDragger:MovieClip;
      
      private var redDraggerValue:Number = 0;
      
      private var currentDragger:MovieClip;
      
      public function ColorSlider()
      {
         super();
         redDragger.addEventListener(MouseEvent.MOUSE_DOWN,startDragging);
         greenDragger.addEventListener(MouseEvent.MOUSE_DOWN,startDragging);
         blueDragger.addEventListener(MouseEvent.MOUSE_DOWN,startDragging);
      }
      
      public function get hexValue() : String
      {
         var _loc1_:String = null;
         _loc1_ = value.toString(16);
         while(_loc1_.length < 6)
         {
            _loc1_ = "0" + _loc1_;
         }
         return _loc1_;
      }
      
      public function get value() : Number
      {
         return int(redDraggerValue << 16 | greenDraggerValue << 8 | blueDraggerValue);
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
         _loc2_ = mouseX;
         if(_loc2_ < minSlide)
         {
            _loc2_ = minSlide;
         }
         else if(_loc2_ > maxSlide)
         {
            _loc2_ = maxSlide;
         }
         this[currentDragger.name + "Value"] = minSliderValue + (maxSliderValue - minSliderValue) * (_loc2_ - minSlide) / (maxSlide - minSlide);
         currentDragger.x = _loc2_;
         dispatchEvent(new Event(Event.CHANGE));
      }
      
      private function startDragging(param1:MouseEvent) : void
      {
         currentDragger = MovieClip(param1.currentTarget);
         stage.addEventListener(MouseEvent.MOUSE_MOVE,duringDragging);
         stage.addEventListener(MouseEvent.MOUSE_UP,endDragging);
         dispatchEvent(new Event("startDrag"));
      }
      
      public function set value(param1:Number) : void
      {
         var _loc2_:Number = NaN;
         _loc2_ = this.value;
         if(param1 == _loc2_)
         {
            return;
         }
         if(param1 < minValue)
         {
            _loc2_ = minValue;
         }
         else if(param1 > maxValue)
         {
            _loc2_ = maxValue;
         }
         else
         {
            _loc2_ = param1;
         }
         redDraggerValue = _loc2_ >> 16;
         greenDraggerValue = _loc2_ >> 8 & 0xFF;
         blueDraggerValue = _loc2_ & 0xFF;
         redDragger.x = minSlide + (maxSlide - minSlide) * (redDraggerValue / (maxSliderValue - minSliderValue));
         greenDragger.x = minSlide + (maxSlide - minSlide) * (greenDraggerValue / (maxSliderValue - minSliderValue));
         blueDragger.x = minSlide + (maxSlide - minSlide) * (blueDraggerValue / (maxSliderValue - minSliderValue));
      }
   }
}

