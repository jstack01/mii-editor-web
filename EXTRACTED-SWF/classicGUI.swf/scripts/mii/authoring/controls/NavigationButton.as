package mii.authoring.controls
{
   import flash.events.MouseEvent;
   import mii.authoring.ClassicGUI;
   
   [Embed(source="/_assets/assets.swf", symbol="symbol318")]
   public class NavigationButton extends AbstractHoverHilite
   {
      
      public var target:ClassicGUI;
      
      public var frameName:String;
      
      public function NavigationButton()
      {
         super();
         target = ClassicGUI(root);
         if(name.indexOf("nav") == 0)
         {
            frameName = "frame" + name.slice(3);
            addEventListener(MouseEvent.CLICK,goNextFrame);
         }
         if(name.indexOf("screen") == 0)
         {
            frameName = "frame" + name.slice(6);
            addEventListener(MouseEvent.CLICK,goScreenFrame);
         }
      }
      
      public function goNextFrame(param1:MouseEvent) : void
      {
         target.gotoAndStop(frameName);
      }
      
      public function goScreenFrame(param1:MouseEvent) : void
      {
         target.screens.gotoAndStop(frameName);
      }
   }
}

