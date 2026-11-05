package mii.authoring.controls
{
   import flash.display.MovieClip;
   import flash.events.Event;
   import mii.authoring.ClassicGUI;
   
   [Embed(source="/_assets/assets.swf", symbol="symbol292")]
   public class Tab extends MovieClip
   {
      
      private var gui:ClassicGUI;
      
      public var frameName:String;
      
      public function Tab()
      {
         super();
         gui = ClassicGUI(root);
         frameName = "frame" + name.slice(3);
         addEventListener("click",goNextFrame);
      }
      
      public function goNextFrame(param1:Event) : void
      {
         gui.gotoAndStop(frameName);
      }
   }
}

