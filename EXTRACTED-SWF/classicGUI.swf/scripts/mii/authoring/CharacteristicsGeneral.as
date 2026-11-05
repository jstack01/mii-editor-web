package mii.authoring
{
   import flash.events.Event;
   import flash.events.MouseEvent;
   import mii.*;
   
   public class CharacteristicsGeneral extends AbstractGUIPage
   {
      
      public var character:MiiCharacterData;
      
      public function CharacteristicsGeneral(param1:ClassicGUI)
      {
         super(param1);
         character = param1.character;
      }
      
      override public function init() : void
      {
         target.toggle_gender.addEventListener(MouseEvent.CLICK,changeToggle);
         target.toggle_mingles.addEventListener(MouseEvent.CLICK,changeToggle);
         target.nameText.addEventListener(Event.CHANGE,changeText);
         target.creatorText.addEventListener(Event.CHANGE,changeText);
         target.birthDateText.addEventListener(Event.CHANGE,changeTextAsInt);
         target.birthMonthText.addEventListener(Event.CHANGE,changeTextAsInt);
         target.idText.addEventListener(Event.CHANGE,changeHex);
         target.wiiText.addEventListener(Event.CHANGE,changeHex);
         target.actionRandom.addEventListener(MouseEvent.CLICK,randomCharacter);
         target.status_mingles.mouseEnabled = false;
         target.status_gender.mouseEnabled = false;
         target.birthDateText.restrict = "0-9";
         target.birthMonthText.restrict = "0-9";
         zoomOut();
      }
      
      public function changeHex(param1:Event) : void
      {
         character.setHex(param1.currentTarget.name.slice(0,-4),param1.currentTarget.text);
         target.updateURLText();
         target.charGraphics.drawCharacter();
      }
      
      override public function deconstruct() : void
      {
         restoreZoom();
      }
      
      public function changeTextAsInt(param1:Event) : void
      {
         var _loc2_:String = null;
         var _loc3_:int = 0;
         if(Boolean(param1.currentTarget.text) && isNaN(param1.currentTarget.text))
         {
            return;
         }
         _loc2_ = param1.currentTarget.name.slice(0,-4);
         _loc3_ = param1.currentTarget.text ? int(param1.currentTarget.text) : 0;
         character.setValue(_loc2_,_loc3_);
         target.updateURLText();
      }
      
      public function randomCharacter(param1:MouseEvent) : void
      {
         character.randomize();
         target.charGraphics.drawCharacter();
         updateGUI();
      }
      
      override public function updateGUI() : void
      {
         var _loc1_:Number = NaN;
         var _loc2_:* = undefined;
         super.updateGUI();
         _loc1_ = character.getValue("gender") + 1;
         target.status_gender.gotoAndStop(_loc1_);
         _loc1_ = character.getValue("mingles") + 1;
         target.status_mingles.gotoAndStop(_loc1_);
         target.nameText.text = character.getValue("name");
         target.creatorText.text = character.getValue("creator");
         target.idText.text = String(character.getHex("id"));
         target.wiiText.text = String(character.getHex("wii"));
         _loc2_ = character.getValue("birthDate");
         target.birthDateText.text = _loc2_ ? String(_loc2_) : "";
         _loc2_ = character.getValue("birthMonth");
         target.birthMonthText.text = _loc2_ ? String(_loc2_) : "";
         target.setupColors("favorite");
         target.updateURLText();
         updateZoomPosition();
      }
      
      public function changeText(param1:Event) : void
      {
         var _loc2_:String = null;
         var _loc3_:String = null;
         _loc2_ = param1.currentTarget.text;
         _loc3_ = param1.currentTarget.name.slice(0,-4);
         character.setValue(_loc3_,_loc2_);
         target.updateURLText();
      }
   }
}

