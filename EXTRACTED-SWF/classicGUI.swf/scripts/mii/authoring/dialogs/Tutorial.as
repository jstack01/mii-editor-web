package mii.authoring.dialogs
{
   import com.senocular.ui.VirtualMouse;
   import flash.display.MovieClip;
   import flash.display.SimpleButton;
   import flash.events.Event;
   import flash.events.MouseEvent;
   import flash.geom.Point;
   import mii.authoring.controls.EditorMouse;
   
   [Embed(source="/_assets/assets.swf", symbol="symbol288")]
   public class Tutorial extends MovieClip
   {
      
      private var movementDelay:Number = 30;
      
      private const part:String = "toggle_hairPart";
      
      public var fingerCursor:MovieClip;
      
      public var restartButton:SimpleButton;
      
      private const accessories:Array = ["nav_accessories","nav_accessories2","nav_accessories3","nav_accessories4"];
      
      private var endMouseLoc:Point = new Point();
      
      private var currentTutorialStep:int = 0;
      
      private const colors:Array = ["colorX"];
      
      private var speedFactor:Number = 1;
      
      private const modifiers:Array = ["option_Y_0","option_Y_1","option_Size_1","option_Size_0","option_Rotation_0","option_Rotation_1","option_X_0","option_X_1"];
      
      public var playButton:SimpleButton;
      
      private const tabOffset:Point = new Point(0,35);
      
      private var currentMouseStep:int = 0;
      
      private const mingles:String = "toggle_mingles";
      
      private const tabs:Array = ["tab_basic","tab_size","tab_face","tab_hair","tab_eyebrows","tab_eyes","tab_nose","tab_lips","tab_accessories"];
      
      private const sliders:Array = ["slider_height","slider_width"];
      
      private const gender:String = "toggle_gender";
      
      private const faces:Array = ["nav_face","nav_face2"];
      
      public var pauseButton:SimpleButton;
      
      private const pages:Array = ["page_prev","page_next"];
      
      private var clickDelay:Number = 10;
      
      private var startMouseLoc:Point = new Point();
      
      private const items:Array = ["itemX"];
      
      public function Tutorial()
      {
         var _loc1_:VirtualMouse = null;
         super();
         restartButton.addEventListener(MouseEvent.CLICK,restartHandler);
         playButton.addEventListener(MouseEvent.CLICK,startHandler);
         pauseButton.addEventListener(MouseEvent.CLICK,pauseHandler);
         _loc1_ = EditorMouse.getInstance();
         _loc1_.ignore(this);
      }
      
      private function restartHandler(param1:MouseEvent) : void
      {
         currentTutorialStep = 0;
      }
      
      private function pauseHandler(param1:MouseEvent) : void
      {
         removeEventListener(Event.ENTER_FRAME,playbackHandler);
      }
      
      private function easeMethod(param1:Number) : Number
      {
         if(param1 < 0.5)
         {
            param1 = param1 * param1 * 2;
         }
         else
         {
            param1 = 1 - (param1 - 0.5) * 2;
            param1 = 0.5 + (1 - param1 * param1) / 2;
         }
         return param1;
      }
      
      private function playbackHandler(param1:MouseEvent) : void
      {
         var _loc2_:Number = NaN;
         var _loc3_:VirtualMouse = null;
         ++currentMouseStep;
         if(currentMouseStep > movementDelay)
         {
            currentMouseStep = 0;
         }
         _loc2_ = currentMouseStep / movementDelay;
         _loc3_ = EditorMouse.getInstance();
         _loc3_.setLocation(Point.interpolate(endMouseLoc,startMouseLoc,easeMethod(_loc2_)));
         fingerCursor.x = _loc3_.x;
         fingerCursor.y = _loc3_.y;
      }
      
      private function startHandler(param1:MouseEvent) : void
      {
         addEventListener(Event.ENTER_FRAME,playbackHandler);
      }
      
      private function compare(param1:*, param2:*) : *
      {
         var _loc3_:Array = null;
         _loc3_ = [];
      }
   }
}

