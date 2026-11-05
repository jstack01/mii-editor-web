package mii.authoring
{
   public class CharacteristicsGlasses extends AbstractGUIPage
   {
      
      public function CharacteristicsGlasses(param1:ClassicGUI)
      {
         super(param1);
         pageCount = 1;
         itemCount = 9;
         currPage = 0;
         currProp = "glasses";
      }
      
      override public function updateGUI() : void
      {
         super.updateGUI();
         target.assignItemListeners();
         target.setupColors("glasses");
         target.assignOptionListeners(["Y","Size"]);
         target.drawPage();
         target.updateURLText();
      }
   }
}

