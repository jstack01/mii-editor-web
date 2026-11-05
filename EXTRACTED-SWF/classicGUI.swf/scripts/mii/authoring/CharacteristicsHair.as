package mii.authoring
{
   import flash.events.MouseEvent;
   
   public class CharacteristicsHair extends AbstractGUIPage
   {
      
      public function CharacteristicsHair(param1:ClassicGUI)
      {
         super(param1);
         pageCount = 6;
         itemCount = 12;
         currPage = 0;
         currProp = "hair";
      }
      
      override public function updateGUI() : void
      {
         super.updateGUI();
         target.assignItemListeners();
         target.assignPageListeners();
         target.setupColors("hair");
         target.toggle_hairPart.addEventListener(MouseEvent.CLICK,changeToggle);
         target.drawPage();
         target.updateURLText();
      }
   }
}

