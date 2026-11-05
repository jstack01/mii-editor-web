package mii.authoring.controls
{
   import flash.display.MovieClip;
   import flash.events.MouseEvent;
   import flash.geom.ColorTransform;
   
   public class AbstractHoverHilite extends MovieClip
   {
      
      public function AbstractHoverHilite()
      {
         super();
         addEventListener(MouseEvent.MOUSE_DOWN,pressHilite);
         addEventListener(MouseEvent.ROLL_OVER,hoverHilite);
         addEventListener(MouseEvent.ROLL_OUT,unHoverHilite);
         addEventListener(MouseEvent.MOUSE_UP,hoverHilite);
      }
      
      private function unHoverHilite(param1:MouseEvent) : void
      {
         transform.colorTransform = new ColorTransform(1,1,1,alpha,0,0,0,0);
      }
      
      private function pressHilite(param1:MouseEvent) : void
      {
         transform.colorTransform = new ColorTransform(1,1,1,alpha,-20,-20,-20,0);
         stage.addEventListener(MouseEvent.MOUSE_UP,unPressHilite);
         removeEventListener(MouseEvent.ROLL_OVER,hoverHilite);
         removeEventListener(MouseEvent.ROLL_OUT,unHoverHilite);
      }
      
      private function hoverHilite(param1:MouseEvent) : void
      {
         transform.colorTransform = new ColorTransform(1,1,1,alpha,20,20,20,0);
      }
      
      private function unPressHilite(param1:MouseEvent) : void
      {
         transform.colorTransform = new ColorTransform(1,1,1,alpha,0,0,0,0);
         stage.removeEventListener(MouseEvent.MOUSE_UP,unPressHilite);
         addEventListener(MouseEvent.ROLL_OVER,hoverHilite);
         addEventListener(MouseEvent.ROLL_OUT,unHoverHilite);
      }
   }
}

