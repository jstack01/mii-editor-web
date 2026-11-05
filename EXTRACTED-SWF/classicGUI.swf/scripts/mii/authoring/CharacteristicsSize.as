package mii.authoring
{
   import flash.events.Event;
   import mii.*;
   
   public class CharacteristicsSize extends AbstractGUIPage
   {
      
      private const MAX_SIZE:int = 127;
      
      public var character:MiiCharacterData;
      
      public function CharacteristicsSize(param1:ClassicGUI)
      {
         super(param1);
         character = param1.character;
      }
      
      override public function init() : void
      {
         zoomOut();
      }
      
      override public function deconstruct() : void
      {
         restoreZoom();
      }
      
      public function updateDataFromSliders(param1:Event) : void
      {
         character.setValue("height",int(MAX_SIZE * target.slider_height.getPercent()));
         character.setValue("weight",int(MAX_SIZE * target.slider_weight.getPercent()));
         target.charGraphics.drawCharacterBody();
         updateZoomPosition();
      }
      
      override public function updateGUI() : void
      {
         super.updateGUI();
         target.slider_height.setPercent(character.getValue("height") / MAX_SIZE);
         target.slider_weight.setPercent(character.getValue("weight") / MAX_SIZE);
         target.slider_height.addEventListener(Event.CHANGE,updateDataFromSliders);
         target.slider_weight.addEventListener(Event.CHANGE,updateDataFromSliders);
         target.updateURLText();
      }
   }
}

