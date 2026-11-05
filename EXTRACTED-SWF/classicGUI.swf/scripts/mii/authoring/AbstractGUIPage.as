package mii.authoring
{
   import flash.display.MovieClip;
   import flash.events.MouseEvent;
   import flash.geom.Point;
   import mii.*;
   
   public class AbstractGUIPage extends MovieClip
   {
      
      public var sizingScale:Number = 0.53;
      
      public var target:ClassicGUI;
      
      public var currProp:String = "";
      
      public var itemCount:int = 0;
      
      public var sizingFootingY:Number = 405;
      
      public var pageCount:int = 0;
      
      public var currPage:int = 0;
      
      public function AbstractGUIPage(param1:ClassicGUI = null)
      {
         super();
         this.target = param1;
      }
      
      public function init() : void
      {
         var _loc1_:String = null;
         var _loc2_:* = undefined;
         if(target != null)
         {
            target.pageCount = pageCount;
            target.itemCount = itemCount;
            target.currProp = currProp;
            _loc1_ = currProp + "Type";
            _loc2_ = target.character.getValue(_loc1_);
            if(_loc1_ in MiiCharacterData.valueToFrameLookup)
            {
               _loc2_ = MiiCharacterData.valueToFrameLookup[_loc1_][_loc2_];
            }
            target.currPage = _loc2_ ? int(_loc2_ / itemCount) : currPage;
         }
      }
      
      public function changeToggle(param1:MouseEvent) : void
      {
         var _loc2_:String = null;
         var _loc3_:* = undefined;
         _loc2_ = param1.currentTarget.name.slice(7);
         _loc3_ = target.character.getValue(_loc2_);
         _loc3_ = _loc3_ ? 0 : 1;
         target.character.setValue(_loc2_,_loc3_);
         target.charGraphics.drawCharacter();
         updateGUI();
      }
      
      public function deconstruct() : void
      {
      }
      
      public function zoomOut() : void
      {
         target.graphicsContainer.scaleX = sizingScale;
         target.graphicsContainer.scaleY = sizingScale;
         updateZoomPosition();
      }
      
      public function restoreZoom() : void
      {
         target.graphicsContainer.scaleX = 1;
         target.graphicsContainer.scaleY = 1;
         target.graphicsContainer.y = target.charGraphics.baseY;
         target.charGraphics.drawCharacter();
      }
      
      public function updateZoomPosition() : void
      {
         var _loc1_:Point = null;
         _loc1_ = target.charGraphics.globalFooting;
         _loc1_ = target.globalToLocal(_loc1_);
         target.graphicsContainer.y -= _loc1_.y - sizingFootingY;
      }
      
      public function updateGUI() : void
      {
      }
   }
}

