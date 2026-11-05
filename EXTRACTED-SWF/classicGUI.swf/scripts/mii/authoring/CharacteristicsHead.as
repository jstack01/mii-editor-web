package mii.authoring
{
   public class CharacteristicsHead extends AbstractGUIPage
   {
      
      public function CharacteristicsHead(param1:ClassicGUI)
      {
         super(param1);
         pageCount = 1;
         itemCount = 8;
         currPage = 0;
         currProp = "head";
      }
      
      override public function updateGUI() : void
      {
         super.updateGUI();
         target.assignItemListeners();
         target.setupColors("skin");
         target.drawPage();
         target.updateURLText();
      }
   }
}

