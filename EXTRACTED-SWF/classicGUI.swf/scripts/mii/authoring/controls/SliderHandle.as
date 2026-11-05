package mii.authoring.controls
{
   import flash.events.Event;
   import flash.events.MouseEvent;
   
   [Embed(source="/_assets/assets.swf", symbol="symbol290")]
   public class SliderHandle extends AbstractHoverHilite
   {
      
      public var min:Number = 301;
      
      public var max:Number = 528;
      
      public var span:Number = max - min;
      
      public var offset:Number = 0;
      
      public function SliderHandle()
      {
         super();
         addEventListener(MouseEvent.MOUSE_DOWN,mouseDownHandler);
      }
      
      public function getPercent() : Number
      {
         return (x - min) / span;
      }
      
      private function mouseMoveHandler(param1:Event) : void
      {
         x = Math.min(Math.max(min,offset + parent.mouseX),max);
         dispatchEvent(new Event("change"));
      }
      
      private function mouseDownHandler(param1:Event) : void
      {
         stage.addEventListener(MouseEvent.MOUSE_MOVE,mouseMoveHandler);
         stage.addEventListener(MouseEvent.MOUSE_UP,clearMoveHandler);
         offset = x - parent.mouseX;
      }
      
      public function setPercent(param1:Number) : void
      {
         if(isNaN(param1) || param1 < 0)
         {
            param1 = 0;
         }
         else if(param1 > 1)
         {
            param1 = 1;
         }
         x = min + span * param1;
         dispatchEvent(new Event("change"));
      }
      
      private function clearMoveHandler(param1:Event) : void
      {
         stage.removeEventListener(MouseEvent.MOUSE_MOVE,mouseMoveHandler);
         stage.removeEventListener(MouseEvent.MOUSE_UP,clearMoveHandler);
      }
   }
}

