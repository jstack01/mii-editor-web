package mii.authoring
{
   public class CharacteristicsMustache extends AbstractGUIPage
   {
      
      public function CharacteristicsMustache(param1:ClassicGUI)
      {
         super(param1);
         pageCount = 1;
         itemCount = 4;
         currPage = 0;
         currProp = "mustache";
      }
      
      override public function updateGUI() : void
      {
         super.updateGUI();
         target.assignItemListeners();
         target.setupColors("facialHair");
         target.assignOptionListeners(["Y","Size"]);
         target.drawPage();
         target.updateURLText();
      }
   }
}

