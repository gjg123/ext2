Ext.ns('App');

//Ext.Loader.setConfig({enabled: true, disableCaching : false });
//Ext.Loader.setPath('Sch', '../../../ExtScheduler2.x/js/Sch');
//Ext.Loader.setPath('Gnt', '../../js/Gnt');

Ext.require([
    'Gnt.panel.Gantt',
    'Gnt.column.PercentDone',
    'Gnt.column.StartDate',
    'Gnt.column.EndDate',
    'Sch.plugin.TreeCellEditing'
]);

Ext.onReady(function() { Localize(); App.Gantt.init(); });

App.Gantt = {

    // Initialize application
    init: function (serverCfg) {
        Ext.QuickTips.init();

        var taskStore = Ext.create("Gnt.data.TaskStore", {
            model : 'Gnt.model.Task',
            autoLoad: true,
            proxy : {
                type : 'ajax',
                method: 'GET',
                url: 'tasks.xml',
                reader: {
                    type : 'xml',
                    // records will have a 'Task' tag
                    record: "Task",
                    root: "Tasks",
                    idProperty: "Id"
                }
            },
            sorters: [{
                property: 'leaf',
                direction: 'ASC'
            }]
        });

        var dependencyStore = Ext.create("Ext.data.Store", {
            autoLoad: true,
            model : 'Gnt.model.Dependency',
            proxy: {
                type : 'ajax',
                url: 'dependencies.xml',
                method: 'GET',
                reader: {
                    type : 'xml',
                    root : 'Links',
                    record: 'Link' // records will have a 'Link' tag
                }
            }
        });


        var colSlider = Ext.create("Ext.slider.Single", {
            width: 120,
            value: 100, // TODO Sch.PresetManager.getPreset('weekAndDayLetter').timeColumnWidth,
            minValue: 80,
            maxValue: 240,
            increment: 10
        });

        var cellEditing = Ext.create('Sch.plugin.TreeCellEditing', {
            clicksToEdit: 1,
            listeners : {
                beforeedit : function() { return !Ext.getCmp('demo-readonlybutton').pressed; }
            }
        });

        var g = Ext.create('Gnt.panel.Gantt', {
            height: 350,
            width: 1000,
            renderTo: Ext.getBody(),
            leftLabelField: 'Name',
            highlightWeekends: true,
            loadMask: true,
            enableProgressBarResize: true,
            enableDependencyDragDrop: true,
            //snapToIncrement : true,
            startDate: new Date(2010, 0, 4),
            endDate: Sch.util.Date.add(new Date(2010, 0, 4), Sch.util.Date.WEEK, 10),
            viewPreset: 'weekAndDayLetter',
			cascadeChanges: true,

            eventRenderer: function (taskRecord) {
                return {
                    ctcls : taskRecord.get('Id') // Add a CSS class to the task element
                };
            },

            tooltipTpl: new Ext.XTemplate(
                '<ul class="taskTip">',
                    '<li><strong>Task:</strong>{Name}</li>',
                    '<li><strong>Start:</strong>{[Ext.Date.format(values.StartDate, "y-m-d")]}</li>',
                    '<li><strong>Duration:</strong> {Duration}d</li>',
                    '<li><strong>Progress:</strong>{PercentDone}%</li>',
                '</ul>'
            ).compile(),


            // Setup your static columns
            columns: [
                {
                    xtype : 'treecolumn',
                    header: 'Tasks',
                    sortable: true,
                    dataIndex: 'Name',
                    width: 200,
                    field: {
                        allowBlank: false
                    }
                },
                Ext.create('Gnt.column.StartDate'),
                Ext.create('Gnt.column.EndDate'),
                Ext.create('Gnt.column.PercentDone')
            ],

            taskStore: taskStore,
            dependencyStore: dependencyStore,
            plugins: [cellEditing],
            
            tbar: [
                {
                    text: '添加新任务',
                    iconCls: 'icon-add',
                    handler: function () {
                        var newTask = new taskStore.model({
                                Name: 'New task',
                                leaf : true,
                                PercentDone: 0
                            });
                        taskStore.getRootNode().appendChild(newTask);
                    }
                },
                {
                    enableToggle: true,
                    id : 'demo-readonlybutton',
                    text: '只读模式',
                    pressed: false,
                    handler: function () {
                        g.setReadOnly(this.pressed);
                    }
                },
                '->',
                {
                    xtype: 'label',
                    text: '时间宽度'
                },
                ' ',
                colSlider
            ]
        });

        colSlider.on({
            change: function (s, v) {
                g.setTimeColumnWidth(v, true);
            },
            changecomplete: function (s, v) {
                g.setTimeColumnWidth(v);
            }
        });
    }
};
