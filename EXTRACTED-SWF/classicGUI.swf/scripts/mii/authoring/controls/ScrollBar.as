package mii.authoring.controls
{
   import flash.display.MovieClip;
   import flash.events.Event;
   import flash.events.MouseEvent;
   import flash.text.TextField;
   import mii.values.Range;
   
   [Embed(source="/_assets/assets.swf", symbol="symbol316")]
   public class ScrollBar extends MovieClip
   {
      
      public var scrollerRange:Range = new Range(40,304);
      
      private var doScrollUpdate:Boolean = true;
      
      public var arrowDown:MovieClip;
      
      public var arrowUp:MovieClip;
      
      public var scroller:MovieClip;
      
      private var _target:TextField;
      
      public function ScrollBar()
      {
         super();
         arrowUp.addEventListener(MouseEvent.CLICK,scrollUp);
         arrowDown.addEventListener(MouseEvent.CLICK,scrollDown);
         scroller.addEventListener(MouseEvent.MOUSE_DOWN,mouseDown);
      }
      
      private function scrollDown(param1:MouseEvent) : void
      {
         if(!target)
         {
            return;
         }
         ++_target.scrollV;
      }
      
      public function set target(param1:TextField) : void
      {
         if(_target)
         {
            _target.removeEventListener(Event.SCROLL,updateScrollerPosition);
         }
         _target = param1;
         _target.addEventListener(Event.SCROLL,updateScrollerPosition);
      }
      
      private function mouseUp(param1:MouseEvent) : void
      {
         stage.removeEventListener(MouseEvent.MOUSE_MOVE,scrollDrag);
         stage.removeEventListener(MouseEvent.MOUSE_UP,mouseUp);
         doScrollUpdate = true;
      }
      
      private function scrollUp(param1:MouseEvent) : void
      {
         if(!target)
         {
            return;
         }
         --_target.scrollV;
      }
      
      public function get target() : TextField
      {
         return _target;
      }
      
      private function scrollDrag(param1:MouseEvent) : void
      {
         var _loc2_:Number = NaN;
         var _loc3_:Range = null;
         if(!target)
         {
            return;
         }
         _loc2_ = scrollerRange.clamp(mouseY);
         scroller.y = _loc2_;
         _loc3_ = new Range(1,_target.maxScrollV);
         _target.scrollV = _loc3_.valueAt(scrollerRange.percentAt(_loc2_),true);
      }
      
      private function updateScrollerPosition(param1:Event) : void
      {
         var _loc2_:Range = null;
         if(!doScrollUpdate)
         {
            return;
         }
         _loc2_ = new Range(1,_target.maxScrollV);
         scroller.y = scrollerRange.valueAt(_loc2_.percentAt(_target.scrollV));
      }
      
      private function mouseDown(param1:MouseEvent) : void
      {
         stage.addEventListener(MouseEvent.MOUSE_MOVE,scrollDrag);
         stage.addEventListener(MouseEvent.MOUSE_UP,mouseUp);
         doScrollUpdate = false;
      }
   }
}

